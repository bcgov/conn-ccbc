begin;

insert into cif.operator (id, legal_name, trade_name, bc_registry_id)
overriding system value
values

  (1, 'first operator legal name', 'first operator trade name', 'AB1234567'),

  (2, 'second operator legal name', 'second operator trade name', 'CD2345678'),

  (3, 'third operator legal name', 'third operator trade name', 'EF3456789')

on conflict (id) do update set
legal_name = excluded.legal_name,
trade_name = excluded.trade_name,
bc_registry_id = excluded.bc_registry_id;

commit;
