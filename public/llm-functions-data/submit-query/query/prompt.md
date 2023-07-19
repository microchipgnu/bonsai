- ALWAYS use `limit` to avoid large responses.
- ALWAYS use Hasura's syntax for building the queries. 
- ALWAYS generate GraphQL queries based on the schema defined below.
- You can fetch aggregations on columns along with nodes using an aggregation query. The name of the aggregate field is of the form `<field-name>` + `_aggregate`. Use this for questions like "How many tokens does nate.near own?", in this case you use `mb_views_nft_tokens_aggregate`. The query may look like this:

```gql
query MyQuery {
  mb_views_nft_tokens_aggregate(where: {owner: {_eq: "nate.near"}}) {
    aggregate {
      count
    }
  }
}
```

- ALWAYS generate GraphQL queries based on the schema defined below: 

```gql
model mb_store_minters {
  nft_contract_id String
  minter_id       String
  receipt_id      String?
  timestamp       DateTime? @db.Timestamp(6)

  @@id([nft_contract_id, minter_id])
}

model nft_activities {
  receipt_id      String
  tx_sender       String
  sender_pk       String?
  timestamp       DateTime @db.Timestamp(6)
  nft_contract_id String
  token_id        String
  kind            String
  action_sender   String?
  action_receiver String?
  memo            String?
  price           Decimal? @db.Decimal
  currency        String?

  @@id([receipt_id, nft_contract_id, token_id, kind])
}

model nft_approvals {
  nft_contract_id     String
  token_id            String
  approved_account_id String
  approval_id         Decimal  @db.Decimal
  receipt_id          String
  timestamp           DateTime @db.Timestamp(6)

  @@id([nft_contract_id, token_id, approved_account_id])
}

model nft_attributes {
  nft_metadata_id        String
  nft_contract_id        String
  attribute_type         String
  attribute_value        String?
  attribute_display_type String?

  @@id([nft_metadata_id, nft_contract_id, attribute_type])
}

model nft_contracts {
  id                 String    @id
  spec               String
  name               String
  symbol             String?
  icon               String?
  base_uri           String?
  reference          String?
  reference_hash     String?
  created_at         DateTime? @db.Timestamp(6)
  created_receipt_id String?
  owner_id           String?
  is_mintbase        Boolean
  content_flag       String?
  category           String?
}

model nft_earnings {
  nft_contract_id String
  token_id        String
  market_id       String
  approval_id     Decimal  @db.Decimal
  offer_id        BigInt
  receipt_id      String
  timestamp       DateTime @db.Timestamp(6)
  receiver_id     String
  currency        String
  amount          Decimal  @db.Decimal
  is_referral     Boolean
  is_mintbase_cut Boolean  @default(false)
  is_affiliate    Boolean?

  @@id([nft_contract_id, token_id, market_id, approval_id, receiver_id, is_referral, is_mintbase_cut])
}

model nft_metadata {
  id              String  @id
  nft_contract_id String
  reference_blob  Json?
  title           String?
  description     String?
  media           String?
  media_hash      String?
  reference       String?
  reference_hash  String?
  extra           String?
  minter          String?
  base_uri        String?
  content_flag    String?
}


view mb_views_nft_metadata {
  id                        String    @id
  nft_contract_id           String?
  reference_blob            Json?
  title                     String?
  description               String?
  media                     String?
  media_hash                String?
  extra                     String?
  metadata_content_flag     String?
  nft_contract_name         String?
  nft_contract_symbol       String?
  nft_contract_icon         String?
  nft_contract_spec         String?
  base_uri                  String?
  nft_contract_reference    String?
  nft_contract_created_at   DateTime? @db.Timestamp(6)
  nft_contract_owner_id     String?
  nft_contract_is_mintbase  Boolean?
  nft_contract_content_flag String?
}

view mb_views_active_listings {
  nft_contract_id String
  token_id        String
  market_id       String
  approval_id     Decimal   @db.Decimal
  created_at      DateTime? @db.Timestamp(6)
  receipt_id      String?
  kind            String?
  price           Decimal?  @db.Decimal
  currency        String?
  listed_by       String?
  metadata_id     String?
  reference       String?
  minter          String?
  title           String?
  description     String?
  reference_blob  Json?
  media           String?
  extra           String?
  base_uri        String?
  content_flag    String?

  @@id([nft_contract_id, token_id, market_id, approval_id])
}


view mb_views_nft_tokens {
  nft_contract_id           String
  token_id                  String
  owner                     String?
  mint_memo                 String?
  last_transfer_timestamp   DateTime? @db.Timestamp(6)
  last_transfer_receipt_id  String?
  minted_timestamp          DateTime? @db.Timestamp(6)
  minted_receipt_id         String?
  burned_timestamp          DateTime? @db.Timestamp(6)
  burned_receipt_id         String?
  minter                    String?
  reference                 String?
  reference_hash            String?
  copies                    BigInt?
  issued_at                 DateTime? @db.Timestamp(6)
  expires_at                DateTime? @db.Timestamp(6)
  starts_at                 DateTime? @db.Timestamp(6)
  updated_at                DateTime? @db.Timestamp(6)
  metadata_id               String?
  reference_blob            Json?
  title                     String?
  description               String?
  media                     String?
  media_hash                String?
  extra                     String?
  metadata_content_flag     String?
  nft_contract_name         String?
  nft_contract_symbol       String?
  nft_contract_icon         String?
  nft_contract_spec         String?
  base_uri                  String?
  nft_contract_reference    String?
  nft_contract_created_at   DateTime? @db.Timestamp(6)
  nft_contract_owner_id     String?
  nft_contract_is_mintbase  Boolean?
  nft_contract_content_flag String?
  royalties_percent         Int?
  royalties                 Json?
  splits                    Json?

  @@id([nft_contract_id, token_id])
}

view mb_views_nft_tokens_with_listing {
  nft_contract_id String
  token_id        String
  owner           String?
  metadata_id     String?
  price           Decimal? @db.Decimal
  currency        String?
  reference_blob  Json?
  content_flag    String?

  @@id([nft_contract_id, token_id])
}


view mb_views_active_listings_by_contract {
  nft_contract_id String
  base_uri        String?
  price           Decimal?  @db.Decimal
  currency        String?
  created_at      DateTime? @db.Timestamp(6)
  metadata_id     String?
  token_id        String
  market_id       String
  approval_id     Decimal   @db.Decimal
  listed_by       String?
  total_listings  BigInt?
  title           String?
  media           String?

  @@id([nft_contract_id, token_id, market_id, approval_id])
}

```