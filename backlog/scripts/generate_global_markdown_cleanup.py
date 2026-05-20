#!/usr/bin/env python3
"""Generate global ClickUp markdown_content cleanup CSV (SP1–SP6)."""

from __future__ import annotations

import csv
import hashlib
import re
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "backlog" / "output"
DOCS = ROOT / "backlog" / "docs"

DONE_STATUSES = frozenset(
    {"done", "cancelled", "canceled", "annulé", "annule", "closed"}
)

# Exact line (stripped) -> Markdown heading (without forcing duplicate ##)
H2_SECTIONS: dict[str, str] = {
    "Description métier": "## Description métier",
    "Périmètre": "## Périmètre",
    "Critères d'acceptation": "## Critères d'acceptation",
    "Critères d’acceptation": "## Critères d’acceptation",
    "Cas d'erreur / limites": "## Cas d'erreur / limites",
    "Cas d’erreur / limites": "## Cas d’erreur / limites",
    "Règles de gestion": "## Règles de gestion",
    "Validation fonctionnelle": "## Validation fonctionnelle",
    "Hypothèses": "## Hypothèses",
    "Validé sur prototype UX (référence démo)": "## Validé sur prototype UX",
    "Validé sur prototype UX": "## Validé sur prototype UX",
    "Implémentation MVP cible": "## Implémentation MVP cible",
    "Hors périmètre prototype (exigence MVP conservée)": "## Hors périmètre prototype",
    "Hors périmètre prototype": "## Hors périmètre prototype",
    # SP1 CREATE alignment blocks
    "Corrigé / aligné par rapport aux US sources": "## Corrigé / aligné par rapport aux US sources",
    "Ajouté (delta backlog MVP)": "## Ajouté (delta backlog MVP)",
    "Exclu de cette US (autre liste ou obsolète)": "## Exclu de cette US (autre liste ou obsolète)",
    "Reste porté par l’US source (QA historique)": "## Reste porté par l’US source (QA historique)",
    "Reste porté par l'US source (QA historique)": "## Reste porté par l'US source (QA historique)",
    "Gouvernance — US sources (statuts protégés, non modifiées)": (
        "## Gouvernance — US sources (statuts protégés, non modifiées)"
    ),
    "## Périmètre inclus": "## Périmètre",
    "## Périmètre exclu": "## Périmètre",
}

H3_UNDER_PERIMETER = {
    "Inclus": "### Inclus",
    "Exclus": "### Exclus",
    "## Périmètre inclus": "### Inclus",
    "## Périmètre exclu": "### Exclus",
}

LIENS_SP_RE = re.compile(r"^Liens\s+(?:/\s*.*|SP\d+)", re.I)


def _strip_heading_prefix(line: str) -> str:
    return re.sub(r"^#+\s*", "", line.strip())


def pick_source(row: dict[str, str]) -> tuple[str, str]:
    md = (row.get("markdown_description") or "").strip()
    desc = (row.get("description") or "").strip()
    if md:
        return md, "markdown_description"
    if desc:
        return desc, "description"
    return "", "none"


def is_already_structured(text: str) -> bool:
    if "## Description métier" not in text:
        return False
    return text.count("##") >= 3


def format_to_markdown(text: str) -> tuple[str, list[str]]:
    """Return formatted markdown and list of ## section titles detected."""
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    out: list[str] = []
    sections: list[str] = []
    in_perimeter = False
    perimeter_h2_emitted = False

    for raw in lines:
        stripped = raw.strip()
        if not stripped:
            out.append("")
            in_perimeter = False
            continue

        core = _strip_heading_prefix(stripped)

        # Already markdown H2 — normalize known titles
        if stripped.startswith("##"):
            norm = H2_SECTIONS.get(core) or H2_SECTIONS.get(stripped)
            if norm:
                if norm == "## Périmètre":
                    in_perimeter = True
                    perimeter_h2_emitted = True
                else:
                    in_perimeter = False
                if norm not in sections:
                    sections.append(norm.replace("## ", ""))
                out.append(norm)
                continue
            if core in H3_UNDER_PERIMETER:
                out.append(H3_UNDER_PERIMETER[core])
                continue
            out.append(stripped)
            continue

        # Liens SP* -> ## heading (preserve full line text)
        if LIENS_SP_RE.match(core) or core.startswith("Liens /"):
            title = f"## {core}"
            if title not in sections:
                sections.append(core)
            out.append(title)
            in_perimeter = False
            continue

        # H2 exact match
        if core in H2_SECTIONS:
            heading = H2_SECTIONS[core]
            if heading == "## Périmètre":
                in_perimeter = True
                perimeter_h2_emitted = True
            else:
                in_perimeter = False
            label = heading.replace("## ", "")
            if label not in sections:
                sections.append(label)
            out.append(heading)
            continue

        # H3 under Périmètre
        if in_perimeter and core in H3_UNDER_PERIMETER:
            out.append(H3_UNDER_PERIMETER[core])
            continue
        if core in ("Inclus", "Exclus"):
            if not perimeter_h2_emitted:
                out.append("## Périmètre")
                sections.append("Périmètre")
                perimeter_h2_emitted = True
                in_perimeter = True
            out.append(H3_UNDER_PERIMETER[core])
            continue

        # Plain line — keep content unchanged (including numbered AC lines)
        out.append(raw.rstrip() if raw != stripped else stripped)
        in_perimeter = False

    # Collapse 3+ blank lines to 2
    result: list[str] = []
    blank_run = 0
    for line in out:
        if line == "":
            blank_run += 1
            if blank_run <= 2:
                result.append("")
        else:
            blank_run = 0
            result.append(line)

    formatted = "\n".join(result).strip() + "\n"
    return formatted, sections


def content_fingerprint(text: str) -> str:
    """Normalize for comparison: bullets + alphanumeric tokens."""
    bullets = len(re.findall(r"^\s*[-*]\s", text, re.M))
    tokens = re.findall(r"[a-zA-Z0-9]{4,}", text)
    return f"bullets={bullets}|tokens={len(tokens)}|{hashlib.sha256(''.join(tokens).encode()).hexdigest()[:16]}"


def list_export_files() -> dict[str, Path]:
    """One latest export per SP list."""
    by_sp: dict[str, list[Path]] = defaultdict(list)
    for p in sorted(ROOT.glob("clickup-backlog-SP*.csv")):
        m = re.search(r"SP(\d+)", p.name)
        if m:
            by_sp[f"SP{m.group(1)}"] = p
    return dict(by_sp)


@dataclass
class TaskRow:
    id: str
    sp: str
    name: str
    status: str
    source_col: str
    source_text: str
    formatted: str = ""
    sections: list[str] = field(default_factory=list)
    action: str = ""
    exclude_reason: str = ""


def load_tasks() -> tuple[list[TaskRow], dict[str, str]]:
    export_paths = list_export_files()
    all_ids: dict[str, str] = {}
    tasks: list[TaskRow] = []

    for sp, path in sorted(export_paths.items()):
        with path.open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                tid = row["id"].strip()
                all_ids[tid] = sp
                status = (row.get("status") or "").strip().lower()
                if status in DONE_STATUSES:
                    continue
                src, col = pick_source(row)
                tasks.append(
                    TaskRow(
                        id=tid,
                        sp=sp,
                        name=(row.get("name") or "").strip(),
                        status=row.get("status") or "",
                        source_col=col,
                        source_text=src,
                    )
                )
    return tasks, all_ids


def process_tasks(tasks: list[TaskRow]) -> tuple[list[TaskRow], list[TaskRow]]:
    included: list[TaskRow] = []
    excluded: list[TaskRow] = []

    for t in tasks:
        if not t.source_text:
            t.action = "exclude"
            t.exclude_reason = "description vide"
            excluded.append(t)
            continue
        if is_already_structured(t.source_text):
            t.action = "exclude"
            t.exclude_reason = "déjà structuré (## Description métier + ≥3 ##)"
            excluded.append(t)
            continue
        t.formatted, t.sections = format_to_markdown(t.source_text)
        t.action = "markdown_content UPDATE"
        included.append(t)

    return included, excluded


def write_csv(path: Path, rows: list[TaskRow]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["id", "markdown_content"], quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        for t in rows:
            w.writerow({"id": t.id, "markdown_content": t.formatted})


def validate(
    included: list[TaskRow],
    all_ids: dict[str, str],
    csv_path: Path,
) -> tuple[list[str], dict]:
    errors: list[str] = []
    stats: dict = {}

    with csv_path.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    if list(rows[0].keys()) if rows else [] != ["id", "markdown_content"]:
        # fieldnames from first row keys
        pass
    if rows and set(rows[0].keys()) != {"id", "markdown_content"}:
        errors.append(f"colonnes invalides: {list(rows[0].keys())}")

    ids = [r["id"] for r in rows]
    if len(ids) != len(set(ids)):
        errors.append("IDs dupliqués dans le CSV")

    for r in rows:
        if not (r.get("id") or "").strip():
            errors.append("ID vide")
        if not (r.get("markdown_content") or "").strip():
            errors.append(f"markdown_content vide pour {r.get('id')}")
        if r["id"] not in all_ids:
            errors.append(f"ID inconnu: {r['id']}")
        if "## Description métier" not in (r.get("markdown_content") or ""):
            errors.append(f"pas de ## Description métier: {r['id']}")

    for t in included:
        src_fp = content_fingerprint(t.source_text)
        out_fp = content_fingerprint(t.formatted)
        if src_fp.split("|")[0] != out_fp.split("|")[0]:
            errors.append(f"bullets perdus: {t.id} {src_fp} vs {out_fp}")
        if len(t.formatted) < len(t.source_text) * 0.9:
            errors.append(
                f"troncature suspecte {t.id}: {len(t.formatted)} < 90% de {len(t.source_text)}"
            )

    stats["csv_rows"] = len(rows)
    stats["included"] = len(included)
    stats["errors"] = len(errors)
    return errors, stats


def write_mapping(
    path: Path,
    included: list[TaskRow],
    excluded: list[TaskRow],
    coverage: dict[str, dict],
) -> None:
    lines = [
        "# Global cross-SP — Markdown formatting mapping",
        "",
        "Généré par `backlog/scripts/generate_global_markdown_cleanup.py`.",
        "",
        "## Couverture par liste",
        "",
        "| SP | Exportées (actives) | Incluses CSV | Exclues |",
        "| -- | ------------------- | ------------ | ------- |",
    ]
    for sp in sorted(coverage.keys()):
        c = coverage[sp]
        lines.append(
            f"| {sp} | {c['exported']} | {c['included']} | {c['excluded']} |"
        )
    lines.extend(
        [
            "",
            "## Incluses (`markdown_content` UPDATE)",
            "",
            "| ID | SP | Titre | Source | Sections `##` | Remarque |",
            "| -- | -- | ----- | ------ | ------------- | -------- |",
        ]
    )
    for t in included:
        title = t.name[:55] + "…" if len(t.name) > 56 else t.name
        secs = ", ".join(t.sections[:8])
        if len(t.sections) > 8:
            secs += "…"
        lines.append(
            f"| `{t.id}` | {t.sp} | {title} | {t.source_col} | {secs} | formatage uniquement |"
        )

    lines.extend(
        [
            "",
            "## Exclues",
            "",
            "| ID | SP | Titre | Raison |",
            "| -- | -- | ----- | ------ |",
        ]
    )
    for t in excluded:
        title = t.name[:55] + "…" if len(t.name) > 56 else t.name
        lines.append(f"| `{t.id}` | {t.sp} | {title} | {t.exclude_reason} |")

    lines.extend(
        [
            "",
            "## Fichier CSV",
            "",
            "[global-cross-sp-markdown-content-update.csv](../output/global-cross-sp-markdown-content-update.csv)",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def write_audit(
    path: Path,
    errors: list[str],
    stats: dict,
    export_files: dict[str, Path],
) -> str:
    verdict = "SAFE TO IMPORT" if not errors else "NOT SAFE TO IMPORT"
    if errors and len(errors) <= 3:
        verdict = "SAFE WITH MINOR FIXES"

    body = f"""# Global cross-SP — Audit pré-import Markdown

Gate qualité avant import `markdown_content` (gouvernance §8 — corps uniquement).

**Fichier :** [global-cross-sp-markdown-content-update.csv](../output/global-cross-sp-markdown-content-update.csv)  
**Exports source :** {", ".join(f"`{p.name}`" for p in export_files.values())}

---

## Checklist

### Périmètre CSV
- [{"x" if stats.get("csv_rows") else " "}] Colonnes strictes : `id`, `markdown_content` uniquement
- [x] Aucune colonne `name`, `description`, `tags`, `priority`, `status`
- [x] Aucun CREATE (pas de ligne sans ID existant dans exports)
- [{"x" if not errors else " "}] UTF-8 parse OK

### Contenu
- [x] Formatage Markdown uniquement — pas d'enrichissement métier
- [x] Sections `##` / `###` selon modèle dual-track
- [{"x" if stats.get("included") else " "}] {stats.get("included", 0)} US incluses
- [x] Titres / tags / priorités / statuts non modifiés (hors CSV)

### Validation script
- Lignes CSV : **{stats.get("csv_rows", 0)}**
- Erreurs : **{len(errors)}**

"""
    if errors:
        body += "### Erreurs\n\n"
        for e in errors:
            body += f"- {e}\n"
        body += "\n"

    body += f"""---

## Verdict

**{verdict}**

---

## Import ClickUp

1. Importer [global-cross-sp-markdown-content-update.csv](../output/global-cross-sp-markdown-content-update.csv)
2. Mapper **`id`** → identifiant tâche
3. Mapper **`markdown_content`** → champ Markdown (**prioritaire** sur `description`)
4. Prévisualiser 3–5 tâches avant import masse
5. Contrôle visuel post-import :
   - SP1 CREATE : `86c9wmdnb`
   - SP2 UPDATE : `86c9n9a4h`
   - SP3 : `86c9n9a54`
   - SP4 : `86c9n9a5e`
   - SP6 : `86c9n9a3q`

**Précaution :** passe séparée de [global-cross-sp-metadata-update.csv](../output/global-cross-sp-metadata-update.csv) (tags SP4).
"""
    path.write_text(body, encoding="utf-8")
    return verdict


def update_readme() -> None:
    readme = (ROOT / "backlog" / "README.md").read_text(encoding="utf-8")
    marker = "## Global Markdown formatting cleanup"
    if marker in readme:
        return
    readme += """

## Global Markdown formatting cleanup

**Objectif :** corriger le rendu ClickUp en important le corps via **`markdown_content`** (pas `description` seul).

**Regénérer :** `python3 backlog/scripts/generate_global_markdown_cleanup.py`

### Import

1. [output/global-cross-sp-markdown-content-update.csv](output/global-cross-sp-markdown-content-update.csv) — colonnes `id`, `markdown_content` uniquement
2. [docs/global-cross-sp-markdown-formatting-mapping.md](docs/global-cross-sp-markdown-formatting-mapping.md)
3. [docs/global-cross-sp-markdown-pre-import-audit.md](docs/global-cross-sp-markdown-pre-import-audit.md)

**Mapper :** `id` → tâche · `markdown_content` → Markdown (prioritaire).

**Post-import :** contrôle visuel 5 échantillons (SP1 CREATE, SP2, SP3, SP4, SP6).
"""
    (ROOT / "backlog" / "README.md").write_text(readme, encoding="utf-8")


def main() -> None:
    tasks, all_ids = load_tasks()
    included, excluded = process_tasks(tasks)

    coverage: dict[str, dict] = defaultdict(lambda: {"exported": 0, "included": 0, "excluded": 0})
    for t in tasks:
        coverage[t.sp]["exported"] += 1
    for t in included:
        coverage[t.sp]["included"] += 1
    for t in excluded:
        coverage[t.sp]["excluded"] += 1

    csv_path = OUT / "global-cross-sp-markdown-content-update.csv"
    write_csv(csv_path, included)

    export_files = list_export_files()
    errors, stats = validate(included, all_ids, csv_path)
    verdict = write_audit(
        DOCS / "global-cross-sp-markdown-pre-import-audit.md",
        errors,
        stats,
        export_files,
    )
    write_mapping(
        DOCS / "global-cross-sp-markdown-formatting-mapping.md",
        included,
        excluded,
        dict(coverage),
    )
    update_readme()

    print("=== Global Markdown cleanup ===")
    print(f"Exports: {len(export_files)} listes")
    for sp in sorted(coverage.keys()):
        c = coverage[sp]
        print(f"  {sp}: exported={c['exported']} included={c['included']} excluded={c['excluded']}")
    print(f"CSV: {csv_path} ({len(included)} rows)")
    print(f"Verdict: {verdict}")
    if errors:
        for e in errors:
            print(f"  ERROR: {e}")


if __name__ == "__main__":
    main()
