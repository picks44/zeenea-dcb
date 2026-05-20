# Global cross-SP — Audit pré-import Markdown

Gate qualité avant import `markdown_content` (gouvernance §8 — corps uniquement).

**Fichier :** [global-cross-sp-markdown-content-update.csv](../output/global-cross-sp-markdown-content-update.csv)  
**Exports source :** `clickup-backlog-SP1_-_Interfaces-2026-05-20-134410.csv`, `clickup-backlog-SP2_-_Editor_&_Lifecycle-2026-05-20-134410.csv`, `clickup-backlog-SP3_-_DDL_Import-2026-05-20-134410.csv`, `clickup-backlog-SP4_-_Versioning-2026-05-20-134410.csv`, `clickup-backlog-SP5_-_Publish_&_Gitops-2026-05-20-134410.csv`, `clickup-backlog-SP6_-_Auth_&_Devops-2026-05-20-134410.csv`

---

## Checklist

### Périmètre CSV
- [x] Colonnes strictes : `id`, `markdown_content` uniquement
- [x] Aucune colonne `name`, `description`, `tags`, `priority`, `status`
- [x] Aucun CREATE (pas de ligne sans ID existant dans exports)
- [x] UTF-8 parse OK

### Contenu
- [x] Formatage Markdown uniquement — pas d'enrichissement métier
- [x] Sections `##` / `###` selon modèle dual-track
- [x] 41 US incluses
- [x] Titres / tags / priorités / statuts non modifiés (hors CSV)

### Validation script
- Lignes CSV : **41**
- Erreurs : **0**

---

## Verdict

**SAFE TO IMPORT**

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
