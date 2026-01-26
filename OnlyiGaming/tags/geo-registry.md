# Geographic Tags (GEO Registry)

## Single Source of Truth

This file is the canonical reference for all geographic tags. It defines regions, countries, and sub-national jurisdictions relevant to iGaming.

**Format:** GEO-[ISO code] for countries, GEO-[region code] for regions, GEO-[country]-[state] for sub-national.

**Key principle:** Region and country tags are independent editorial decisions. Tagging a country does NOT imply its region. See `rules/geographic-model.md` for the full model.

---

## Regions

| Tag | Label | Description |
|-----|-------|-------------|
| GEO-GLOBAL | Global | No specific geographic focus; worldwide relevance |
| GEO-EU | Europe | Pan-European news affecting multiple countries or the EU as a bloc |
| GEO-NA | North America | US + Canada market-wide news |
| GEO-LATAM | Latin America | Central and South American markets collectively |
| GEO-ASIA | Asia Pacific | Asian markets collectively including Oceania |
| GEO-AFRICA | Africa | African markets collectively |
| GEO-ME | Middle East | Middle Eastern markets collectively |
| GEO-OCEANIA | Oceania | Australia, New Zealand, Pacific Islands |

---

## Europe

| Tag | Label | ISO | Regulated Market | Notes |
|-----|-------|-----|-----------------|-------|
| GEO-UK | United Kingdom | GB | Yes | UKGC regulated; major market |
| GEO-MT | Malta | MT | Yes | MGA; major licensing hub |
| GEO-GI | Gibraltar | GI | Yes | Licensing jurisdiction |
| GEO-SE | Sweden | SE | Yes | Spelinspektionen regulated |
| GEO-DK | Denmark | DK | Yes | Spillemyndigheden regulated |
| GEO-ES | Spain | ES | Yes | DGOJ regulated |
| GEO-DE | Germany | DE | Yes | GGL regulated (2021+) |
| GEO-IT | Italy | IT | Yes | ADM regulated |
| GEO-NL | Netherlands | NL | Yes | KSA regulated (2021+) |
| GEO-FR | France | FR | Yes | ANJ regulated |
| GEO-PT | Portugal | PT | Yes | SRIJ regulated |
| GEO-GR | Greece | GR | Yes | HGC regulated |
| GEO-IE | Ireland | IE | Pending | New licensing regime expected |
| GEO-AT | Austria | AT | Partial | Federal/state split |
| GEO-CH | Switzerland | CH | Yes | ESBK regulated |
| GEO-BE | Belgium | BE | Yes | Gaming Commission |
| GEO-PL | Poland | PL | Yes | Limited online market |
| GEO-RO | Romania | RO | Yes | ONJN regulated |
| GEO-BG | Bulgaria | BG | Yes | State Commission regulated |
| GEO-CZ | Czech Republic | CZ | Yes | Licensed market |
| GEO-HR | Croatia | HR | Yes | Licensed market |
| GEO-EE | Estonia | EE | Yes | Licensed market |
| GEO-LT | Lithuania | LT | Yes | Licensed market |
| GEO-LV | Latvia | LV | Yes | Licensed market |
| GEO-FI | Finland | FI | Transitioning | Moving from monopoly to licensing |
| GEO-NO | Norway | NO | Monopoly | Norsk Tipping monopoly |
| GEO-RS | Serbia | RS | Yes | Licensed market |
| GEO-UA | Ukraine | UA | Yes | Licensed 2023+ |
| GEO-CY | Cyprus | CY | Yes | National Betting Authority |
| GEO-IM | Isle of Man | IM | Yes | Licensing jurisdiction |
| GEO-JE | Jersey | JE | Yes | Licensing jurisdiction |
| GEO-LI | Liechtenstein | LI | Yes | Small regulated market |

---

## North America

| Tag | Label | ISO | Regulated Market | Notes |
|-----|-------|-----|-----------------|-------|
| GEO-US | United States | US | State-by-state | No federal online gambling license |
| GEO-CA | Canada | CA | Provincial | Ontario open market; others provincial |
| GEO-MX | Mexico | MX | Partial | SEGOB regulated |

### US States (Regulated for Online Gambling/Sports Betting)

| Tag | State | Online Casino | Sports Betting | Notes |
|-----|-------|--------------|----------------|-------|
| GEO-US-NJ | New Jersey | Yes | Yes | Major market since 2013 |
| GEO-US-PA | Pennsylvania | Yes | Yes | Large population market |
| GEO-US-MI | Michigan | Yes | Yes | Active since 2021 |
| GEO-US-NY | New York | No | Yes (mobile) | Sports betting only |
| GEO-US-IL | Illinois | No | Yes | Sports betting |
| GEO-US-CO | Colorado | No | Yes | Sports betting |
| GEO-US-AZ | Arizona | No | Yes | Sports betting |
| GEO-US-OH | Ohio | No | Yes | Sports betting 2023+ |
| GEO-US-CT | Connecticut | Yes | Yes | Tribal compact model |
| GEO-US-WV | West Virginia | Yes | Yes | Small market |
| GEO-US-VA | Virginia | No | Yes | Sports betting |
| GEO-US-IN | Indiana | No | Yes | Sports betting |
| GEO-US-IA | Iowa | No | Yes | Sports betting |
| GEO-US-TN | Tennessee | No | Yes | Mobile-only sports betting |
| GEO-US-LA | Louisiana | No | Yes | Sports betting |
| GEO-US-MD | Maryland | No | Yes | Sports betting |
| GEO-US-MA | Massachusetts | No | Yes | Sports betting 2023+ |
| GEO-US-KS | Kansas | No | Yes | Sports betting |
| GEO-US-KY | Kentucky | No | Yes | Sports betting 2023+ |
| GEO-US-NC | North Carolina | No | Yes | Sports betting 2024+ |
| GEO-US-VT | Vermont | No | Yes | Sports betting 2024+ |
| GEO-US-DE | Delaware | Yes | Yes | Early adopter |
| GEO-US-NV | Nevada | Limited | Yes | Casino state; limited iGaming |
| GEO-US-RI | Rhode Island | Yes | Yes | Small market |

### Canadian Provinces

| Tag | Province | Notes |
|-----|----------|-------|
| GEO-CA-ON | Ontario | Open competitive market since 2022 |
| GEO-CA-QC | Quebec | Espace Jeux monopoly |
| GEO-CA-BC | British Columbia | PlayNow monopoly |
| GEO-CA-AB | Alberta | PlayAlberta monopoly |

---

## Latin America

| Tag | Label | ISO | Regulated Market | Notes |
|-----|-------|-----|-----------------|-------|
| GEO-BR | Brazil | BR | Yes (2024+) | Major emerging market |
| GEO-AR | Argentina | AR | Provincial | Province-by-province regulation |
| GEO-CO | Colombia | CO | Yes | Coljuegos regulated |
| GEO-CL | Chile | CL | Pending | Legislation in progress |
| GEO-PE | Peru | PE | Yes | MINCETUR regulated |
| GEO-MX | Mexico | MX | Partial | SEGOB regulated |
| GEO-PA | Panama | PA | Yes | Licensed jurisdiction |
| GEO-CR | Costa Rica | CR | Hosting hub | Popular hosting jurisdiction |
| GEO-UY | Uruguay | UY | Partial | Limited online |
| GEO-EC | Ecuador | EC | Pending | Market developing |
| GEO-PY | Paraguay | PY | Partial | Emerging market |

---

## Asia Pacific

| Tag | Label | ISO | Regulated Market | Notes |
|-----|-------|-----|-----------------|-------|
| GEO-PH | Philippines | PH | Yes | PAGCOR regulated; major hub |
| GEO-JP | Japan | JP | Pending | Casino resort legislation |
| GEO-KR | South Korea | KR | Partial | Limited legal gambling |
| GEO-IN | India | IN | State-by-state | Complex regulatory landscape |
| GEO-SG | Singapore | SG | Yes | Strict regulated market |
| GEO-AU | Australia | AU | Yes | ACMA regulated; strict |
| GEO-NZ | New Zealand | NZ | Monopoly | TAB monopoly model |
| GEO-KH | Cambodia | KH | Yes | Emerging market |
| GEO-TH | Thailand | TH | Pending | Legislation under consideration |
| GEO-VN | Vietnam | VN | Pilot | Limited pilot programs |
| GEO-MY | Malaysia | MY | Restricted | Limited legal gambling |
| GEO-ID | Indonesia | ID | Prohibited | No legal gambling |
| GEO-TW | Taiwan | TW | Limited | Sports lottery only |
| GEO-MO | Macau | MO | Yes | Major casino hub |
| GEO-HK | Hong Kong | HK | Limited | HKJC monopoly |
| GEO-BD | Bangladesh | BD | Restricted | Limited |

---

## Africa

| Tag | Label | ISO | Regulated Market | Notes |
|-----|-------|-----|-----------------|-------|
| GEO-ZA | South Africa | ZA | Yes | NGCB regulated |
| GEO-NG | Nigeria | NG | Yes | NLRC regulated; major market |
| GEO-KE | Kenya | KE | Yes | BCLB regulated |
| GEO-GH | Ghana | GH | Yes | Gaming Commission |
| GEO-TZ | Tanzania | TZ | Yes | Gaming Board regulated |
| GEO-UG | Uganda | UG | Yes | Licensed market |
| GEO-RW | Rwanda | RW | Yes | Emerging market |
| GEO-ET | Ethiopia | ET | Partial | Limited |
| GEO-CI | Ivory Coast | CI | Emerging | Developing market |
| GEO-SN | Senegal | SN | Emerging | Developing market |

---

## Middle East

| Tag | Label | ISO | Regulated Market | Notes |
|-----|-------|-----|-----------------|-------|
| GEO-AE | UAE | AE | Emerging | Recent developments in gaming |
| GEO-IL | Israel | IL | Partial | Sports betting discussions |
| GEO-TR | Turkey | TR | Restricted | Limited legal options |
| GEO-SA | Saudi Arabia | SA | Restricted | No current gambling framework |
| GEO-BH | Bahrain | BH | Restricted | Limited |
| GEO-QA | Qatar | QA | Restricted | No gambling |

---

## Hierarchy Reference (UI Grouping Only)

This hierarchy is for **UI organization** (dropdown grouping, filter menus). It does NOT create query inheritance.

```
GEO-GLOBAL
GEO-EU
  ├── GEO-UK, GEO-MT, GEO-GI, GEO-SE, GEO-DK, GEO-ES, GEO-DE, GEO-IT
  ├── GEO-NL, GEO-FR, GEO-PT, GEO-GR, GEO-IE, GEO-AT, GEO-CH, GEO-BE
  ├── GEO-PL, GEO-RO, GEO-BG, GEO-CZ, GEO-HR, GEO-EE, GEO-LT, GEO-LV
  ├── GEO-FI, GEO-NO, GEO-RS, GEO-UA, GEO-CY, GEO-IM, GEO-JE, GEO-LI
GEO-NA
  ├── GEO-US (+ state tags), GEO-CA (+ province tags), GEO-MX
GEO-LATAM
  ├── GEO-BR, GEO-AR, GEO-CO, GEO-CL, GEO-PE, GEO-PA, GEO-CR, GEO-UY, GEO-EC, GEO-PY
GEO-ASIA
  ├── GEO-PH, GEO-JP, GEO-KR, GEO-IN, GEO-SG, GEO-AU, GEO-NZ, GEO-KH
  ├── GEO-TH, GEO-VN, GEO-MY, GEO-ID, GEO-TW, GEO-MO, GEO-HK, GEO-BD
GEO-AFRICA
  ├── GEO-ZA, GEO-NG, GEO-KE, GEO-GH, GEO-TZ, GEO-UG, GEO-RW, GEO-ET, GEO-CI, GEO-SN
GEO-ME
  ├── GEO-AE, GEO-IL, GEO-TR, GEO-SA, GEO-BH, GEO-QA
```

---

## Document Information

| Field | Value |
|-------|-------|
| Total Regions | 8 |
| Total Countries | ~80 |
| Total US States | 24 |
| Total Canadian Provinces | 4 |
| Version | 1.0 |
| Last Updated | January 2026 |
| Source of Truth | This file |
