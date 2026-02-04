---
publish: true
created: 2026-01-27T18:18:52.231-08:00
modified: 2026-02-04T15:20:39.043-08:00
tags:
  - faction
cssclasses: ""
---


Below is a list of the major and minor factions, organizations, clans, syndicates, and orders. 

```base
filters:
  and:
    - file.hasTag("faction")
properties:
  file.name:
    displayName: Name
  tier:
    displayName: Tier
  summary:
    displayName: Summary
views:
  - type: table
    name: Industrialists
    filters:
      and:
        - file.folder.contains("Industrialists")
    order:
      - file.name
      - tier
      - summary
    sort:
      - property: tier
        direction: DESC
      - property: name
        direction: ASC
    imageFit: ""
    cardSize: 420
    columnSize:
      file.name: 217

```

```base
filters:
  and:
    - file.hasTag("faction")
properties:
  file.name:
    displayName: Name
  tier:
    displayName: Tier
  summary:
    displayName: Summary
views:
  - type: table
    name: Naturalists
    filters:
      and:
        - file.folder.contains("Naturalist")
    order:
      - file.name
      - tier
      - summary
    sort:
      - property: tier
        direction: DESC
      - property: name
        direction: ASC
    imageFit: ""
    cardSize: 420
    columnSize:
      file.name: 217

```

```base
filters:
  and:
    - file.hasTag("faction")
properties:
  file.name:
    displayName: Name
  tier:
    displayName: Tier
  summary:
    displayName: Summary
views:
  - type: table
    name: Criminals
    filters:
      and:
        - file.folder.contains("Criminal")
    order:
      - file.name
      - tier
      - summary
    sort:
      - property: tier
        direction: DESC
    imageFit: ""
    cardSize: 420
    columnSize:
      file.name: 217

```