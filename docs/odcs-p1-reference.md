# Référence ODCS P1

Annexe normative — priorités P1 ODCS v3.1.0 pour le prototype Data Contract Builder. Comportement produit : [documentation produit](./product-documentation.md).

---

# Récapitulatif exhaustif des priorités P1 — ODCS v3.1.0 Schema Reference

Source : `odcs-v3.1.0-schema-reference.xlsx`

Total extrait : 55 lignes P1.
Règle d’extraction : lignes dont la colonne `Priority` est strictement égale à `P1`, sur les deux onglets du fichier Excel.

## Onglet `Schema Reference`

Nombre de lignes P1 extraites : 41

| Priority | Section | Required | Property Path | Description | Comment for MVP | Examples / Valid Values |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | Fundamentals | Yes | apiVersion | Version of the ODCS standard used to build this data contract. Default is v3.1.0. | Hard coded to 3.1.0 | v3.1.0 |
| P1 | Fundamentals | Yes | kind | The kind of file this is. Only valid value is DataContract. | Hard coded to DataContract | DataContract |
| P1 | Fundamentals | Yes | id | Unique identifier used to reduce the risk of contract name collisions (e.g. a UUID). | MVP: hybrid id `{slug}-{8hex}` derived from contract name (slug) + stable suffix from contract `uid` (not a pure UUID). Lowercase ASCII slug, no special characters. Uniqueness checked in the local registry at publish. | `seller-payments-v1-a3f91c2b` |
| P1 | Fundamentals | Yes | version | Current version of the data contract. | Managed by the system (see spec) | 1.1.0 |
| P1 | Fundamentals | Yes | status | Current lifecycle status of the data contract. | Managed by the system (see spec) | proposed, draft, active, deprecated, retired |
| P1 | Fundamentals | No | name | Name of the data contract. | ODCS optional; **required by product rules to publish** in this prototype. | seller_payments_v1 |
| P1 | Fundamentals | No | domain | Name of the logical data domain. |  | seller |
| P1 | Fundamentals | No | description | Object containing human-readable descriptions. |  | — |
| P1 | Fundamentals | No | description.purpose | Intended purpose for the provided data. |  | Views built on top of seller tables. |
| P1 | Fundamentals | No | description.limitations | Technical, compliance, and legal limitations for data use. |  | Cannot be used in conjunction with full moon days. |
| P1 | Fundamentals | No | description.usage | Recommended usage of the data. |  | Twice a day, preferable before meals. |
| P1 | Fundamentals | No | description.authoritativeDefinitions | Links to privacy statements, T&Cs, or license agreements. | Supported types; Privacy statement, Terms and Conditions, License Agreement | → authoritativeDefinitions[] |
| P1 | Fundamentals | No | tags | A list of tags for categorizing the contract. |  | → tags[] |
| P1 | Schema | No | schema[].id | Stable unique identifier for the schema object, enabling safe references. | Check for unicity in the contract | tbl_obj |
| P1 | Schema | No | schema[].physicalName | Physical name of the object in the data source. |  | tbl_1_2_0 |
| P1 | Schema | No | schema[].description | Human-readable description of the schema object. |  | Provides core payment metrics |
| P1 | Schema | No | schema[].quality | Data quality rules on the object (e.g. rowCount, compound duplicateValues). | Only Text quality rules, verified by AI | → quality[] |
| P1 | Schema | No | schema[].tags | Tags for categorizing the object. |  | → tags[] |
| P1 | Schema | No | schema[].authoritativeDefinitions | Links to authoritative sources for the object. | Only supports links to items managed in Zeenea (type: actian) | → authoritativeDefinitions[] |
| P1 | Schema | No | schema[].properties[].id | Stable unique identifier for the property, enabling safe references. |  | txn_ref_dt_prop |
| P1 | Schema | No | schema[].properties[].description | Human-readable description of the property. |  | A description for column rcvr_id. |
| P1 | Schema | No | schema[].properties[].physicalType | Physical data type in the data source. |  | VARCHAR(18), DOUBLE, INT, DATE |
| P1 | Schema | No | schema[].properties[].required | Whether the property may contain null values. Default is false. |  | true, false |
| P1 | Schema | No | schema[].properties[].primaryKeyPosition | Position in a composite primary key (starts at 1, -1 = not a PK). |  | 1, 2 |
| P1 | Schema | No | schema[].properties[].quality | Data quality rules for this property. |  | → quality[] |
| P1 | Schema | No | schema[].properties[].physicalName | Physical name of the property in the data source. |  | TXN_REF_DT |
| P1 | Schema | No | schema[].properties[].examples | Sample values for the property. |  | 2022-10-03, 2020-01-28 |
| P1 | Schema | No | schema[].properties[].items | Describes items inside an array property (only when logicalType is array). |  | logicalType: string  \|  logicalType: object + properties |
| P1 | Schema | No | schema[].properties[].relationships | Foreign key relationships to other properties. The from field is implicit at property level. |  | type: foreignKey, to: /schema/orders/properties/id |
| P1 | Schema | No | schema[].properties[].tags | Tags for categorizing the property. |  | → tags[] |
| P1 | Schema | No | schema[].properties[].authoritativeDefinitions | Links to authoritative sources for the property. | Only supports links to items managed in Zeenea (type: actian) | → authoritativeDefinitions[] |
| P1 | SLA | Yes | slaProperties[].property | Specific SLA property type (Data QoS). | ODCS v3.1.0 strict | latency, retention, frequency, availability, throughput, errorRate, generalAvailability, endOfSupport, endOfLife, timeOfAvailability, timeToDetect, timeToNotify, timeToRepair |
| P1 | SLA | Yes | slaProperties[].value | The agreed SLA value. |  | 4, 2022-05-12T09:30:10-08:00, 09:00-08:00 |
| P1 | SLA | No | slaProperties[].unit | Unit for the SLA value (ISO standard). |  | d / day / days, y / yr / years, h / hr / hours |
| P1 | SLA | No | slaProperties[].element | Element path to apply the SLA on, using Object.Property notation. Comma-separate multiples. |  | tab1.txn_ref_dt |
| P1 | SLA | No | slaProperties[].driver | Importance driver for the SLA. |  | regulatory, analytics, operational |
| P1 | SLA | No | slaProperties[].description | Human-readable description of the SLA entry. |  | GA at 12.5.22 |
| P1 | Roles | No | roles | Array of IAM roles that a consumer may need to access the dataset. |  | — |
| P1 | Roles | Yes | roles[].role | Name of the IAM role providing access. |  | microstrategy_user_opr, bq_unica_user_opr |
| P1 | Roles | No | roles[].access | Type of access provided by the IAM role. |  | read, write |
| P1 | Roles | No | roles[].description | Description of the IAM role and its permissions. |  | Read-only access to finance tables |

## Onglet `Shared Components`

Nombre de lignes P1 extraites : 14

| Priority | Property Path | Description | Comment for the MVP | Examples / Valid Values |
| --- | --- | --- | --- | --- |
| P1 | [].id | Stable unique identifier for the quality rule, enabling safe references. |  | order_id_no_nulls |
| P1 | [].name | Short human-readable name for the rule. |  | No nulls in order_id |
| P1 | [].description | Full description of the quality check to be completed. |  | There must be no null values in the column. |
| P1 | [].type | Type of DQ rule. | Only text supported (natural language expression) | library (default), text, sql, custom |
| P1 | [].dimension | Data quality KPI dimension for classification and reporting. |  | accuracy, completeness, conformity, consistency, coverage, timeliness, uniqueness |
| P1 | [].severity | Severity level if the quality rule fails. |  | — |
| P1 | [].businessImpact | Consequences of the rule failure. |  | — |
| P1 | [].url | Access URL using standard URL scheme (https, mailto, etc.). |  | https://catalog.data.gov/dataset/air-quality |
| P1 | [].type | Type of the authoritative definition. |  | businessDefinition, transformationImplementation, videoTutorial, tutorial, implementation |
| P1 | [].description | Optional description of the authoritative definition. |  | Business definition for the dataset. |
| P1 | [].property | Name of the custom property. Use camelCase, matching how it would appear as a standard property. |  | dataSteward, retentionPolicyRef |
| P1 | [].value | Value of the custom property. |  | john.doe@example.com |
| P1 | [].description | Optional description of the custom property. |  | Owner responsible for data quality. |
| P1 | [] | A string label for categorizing an element. Any value is allowed. |  | finance, sensitive, pii, employee_record |