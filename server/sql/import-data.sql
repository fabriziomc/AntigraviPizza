USE AntigraviPizza;
GO

-- Importazione dati da SQLite
-- Generato il 2025-12-03T13:42:44.410Z

INSERT INTO Recipes (id, name, pizzaiolo, source, description, ingredients, instructions, imageUrl, archetype, createdAt, dateAdded, isFavorite, rating, tags)
VALUES ('a1e5c0ed-fc1f-49b1-8afd-27fbf558a5f0', N'Salsiccia fresca e Friarielli', N'Gabriele Bonci', N'Generata da AntigraviPizza', N'Una integrale con salsiccia fresca e friarielli, creata secondo la tradizione.', N'[{"name":"Farina integrale","quantity":500,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Acqua","quantity":340,"unit":"ml","category":"Impasto","phase":"dough","postBake":false},{"name":"Sale marino","quantity":10,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Lievito di birra","quantity":2,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Salsiccia fresca","quantity":88,"unit":"g","category":"Carne","phase":"topping","postBake":false},{"name":"Friarielli","quantity":89,"unit":"g","category":"Verdure","phase":"topping","postBake":false},{"name":"Provola affumicata","quantity":121,"unit":"g","category":"Formaggi","phase":"topping","postBake":false}]', N'{"dough":["Preparare l''impasto integrale con farina integrale, acqua, sale e lievito di birra","Impastare fino ad ottenere un composto liscio ed elastico","Lasciare lievitare: 18 ore a temperatura ambiente","Stendere l''impasto formando un disco di circa 30-35cm di diametro"],"topping":["Aggiungere provola affumicata a pezzetti","Distribuire salsiccia fresca, friarielli","Infornare a 459°C per 146 secondi","Servire immediatamente ben calda"]}', N'https://image.pollinations.ai/prompt/gourmet%20pizza%20Salsiccia%20fresca%20e%20Friarielli%2C%20toppings%3A%20Salsiccia%20fresca%2C%20Friarielli%2C%20professional%20food%20photography%2C%204k%2C%20highly%20detailed%2C%20italian%20style%2C%20rustic%20background', N'', 1764750743560, 1764750743559, 0, 0, N'["Bianca","Gourmet","Classica"]');
INSERT INTO Recipes (id, name, pizzaiolo, source, description, ingredients, instructions, imageUrl, archetype, createdAt, dateAdded, isFavorite, rating, tags)
VALUES ('3a2281a2-8e03-4916-9a41-7ea8a99a1be6', N'Contrasto Pecorino', N'Pier Daniele Seu', N'Generata da AntigraviPizza', N'Un perfetto equilibrio tra la sapidità del pecorino romano e la dolcezza di pere, completata dalla croccantezza di noci.', N'[{"name":"Mix farina 00 e integrale","quantity":500,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Acqua","quantity":350,"unit":"ml","category":"Impasto","phase":"dough","postBake":false},{"name":"Sale marino","quantity":10,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Lievito madre","quantity":100,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Fior di latte","quantity":100,"unit":"g","category":"Formaggi","phase":"topping","postBake":false},{"name":"Pecorino Romano","weight":[30,50],"phase":"topping","postBake":false,"quantity":80,"category":"Formaggi","unit":"g"},{"name":"Pere","weight":[60,100],"phase":"topping","postBake":false,"quantity":60,"category":"Frutta","unit":"g"},{"name":"Noci","weight":[30,50],"phase":"topping","postBake":true,"quantity":30,"category":"Croccante","unit":"g"}]', N'{"dough":["Preparare l''impasto contemporanea con mix farina 00 e integrale, acqua, sale e lievito madre","Impastare fino ad ottenere un composto liscio ed elastico","Lasciare lievitare: 48 ore con doppia lievitazione","Stendere l''impasto formando un disco di circa 30-35cm di diametro"],"topping":["Aggiungere fior di latte, pecorino romano a pezzetti","All''uscita dal forno, aggiungere: noci","Infornare a 448°C per 117 secondi","Servire immediatamente ben calda"]}', N'https://image.pollinations.ai/prompt/gourmet%20pizza%20Contrasto%20Pecorino%2C%20toppings%3A%20Pecorino%20Romano%2C%20Pere%2C%20professional%20food%20photography%2C%204k%2C%20highly%20detailed%2C%20italian%20style%2C%20rustic%20background', N'', 1764750743566, 1764750743566, 0, 0, N'["Contemporanea","Vegetariana","Bianca"]');
INSERT INTO Recipes (id, name, pizzaiolo, source, description, ingredients, instructions, imageUrl, archetype, createdAt, dateAdded, isFavorite, rating, tags)
VALUES ('b3f8a419-3c76-4da3-b4fe-bba79eb59146', N'Prosciutto crudo di Parma e Rucola', N'Pier Daniele Seu', N'Generata da AntigraviPizza', N'Una contemporanea con prosciutto crudo di parma e rucola, creata secondo la tradizione.', N'[{"name":"Mix farina 00 e integrale","quantity":500,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Acqua","quantity":350,"unit":"ml","category":"Impasto","phase":"dough","postBake":false},{"name":"Sale marino","quantity":10,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Lievito madre","quantity":100,"unit":"g","category":"Impasto","phase":"dough","postBake":false},{"name":"Prosciutto crudo di Parma","quantity":80,"unit":"g","category":"Carne","phase":"topping","postBake":true},{"name":"Rucola","quantity":49,"unit":"g","category":"Verdure","phase":"topping","postBake":true},{"name":"Parmigiano Reggiano","quantity":46,"unit":"g","category":"Formaggi","phase":"topping","postBake":false}]', N'{"dough":["Preparare l''impasto contemporanea con mix farina 00 e integrale, acqua, sale e lievito madre","Impastare fino ad ottenere un composto liscio ed elastico","Lasciare lievitare: 48 ore con doppia lievitazione","Stendere l''impasto formando un disco di circa 30-35cm di diametro"],"topping":["Aggiungere parmigiano reggiano a pezzetti","All''uscita dal forno, aggiungere: prosciutto crudo di parma, rucola","Infornare a 474°C per 141 secondi","Servire immediatamente ben calda"]}', N'https://image.pollinations.ai/prompt/gourmet%20pizza%20Prosciutto%20crudo%20di%20Parma%20e%20Rucola%2C%20toppings%3A%20Prosciutto%20crudo%20di%20Parma%2C%20Rucola%2C%20professional%20food%20photography%2C%204k%2C%20highly%20detailed%2C%20italian%20style%2C%20rustic%20background', N'', 1764750743573, 1764750743573, 0, 0, N'["Contemporanea","Bianca","Classica"]');
GO

INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('e58542d2-ce49-4746-a595-57875ac4a4fb', N'["Gorgonzola DOP","Pere","Noci","Miele di acacia"]', 1764750722803);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('0fee44e0-5c25-4046-8d56-3acd059a9eeb', N'["Burrata","Pomodorini ciliegino","Basilico fresco"]', 1764750722824);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('6b373f89-50f2-473e-904e-cf60eda77dce', N'["Salmone affumicato","Ricotta fresca","Rucola","Limone grattugiato"]', 1764750722831);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('f67fc7ca-f690-438a-882d-edee44745214', N'["Prosciutto crudo di Parma","Rucola","Parmigiano Reggiano"]', 1764750722838);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('2ef10a51-c670-45d8-af6e-516c369d9586', N'["Tartufo nero","Funghi porcini","Stracciatella"]', 1764750722846);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('575ed5a1-7a81-4de9-b6dc-15437ec5adad', N'["Nduja calabrese","Burrata","Basilico fresco"]', 1764750722853);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('efa06e82-b040-4be7-8ded-e63b8feff34d', N'["Speck Alto Adige","Taleggio","Radicchio"]', 1764750722859);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('7cd9df7a-02f4-4b1a-b72e-0eb7ac6d21bf', N'["Mortadella","Pistacchi","Stracciatella"]', 1764750722866);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('9a9aece7-66a3-4a4c-a381-7272d69df60e', N'["Salsiccia fresca","Friarielli","Provola affumicata"]', 1764750722873);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('ff49d610-9165-475a-8d4e-3176af0e5e37', N'["Bresaola","Rucola","Parmigiano Reggiano","Limone grattugiato"]', 1764750722880);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('4ddc01fd-7fb1-4986-b13b-0891eb7f0191', N'["Crema di zucca","Pancetta","Gorgonzola DOP","Rosmarino"]', 1764750722887);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('8ae98245-a4f4-4d7c-991e-8dbcba18837f', N'["Crema di pistacchio","Mortadella","Burrata","Pistacchi"]', 1764750722893);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('fee55a47-15d3-4fea-958b-8d27da0cda09', N'["Crema di burrata","Nduja calabrese","Cipolla caramellata"]', 1764750722900);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('6fcf57c9-357b-45f4-94a3-c770d989659f', N'["Fior di latte","Carciofi","Guanciale croccante","Pecorino Romano"]', 1764750722906);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('ea68d397-3d8a-4d96-a388-82492955962c', N'["Pomodoro San Marzano","Melanzane grigliate","Ricotta fresca","Basilico fresco"]', 1764750722914);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('69971cb5-9402-413b-986a-51a1249f6dc4', N'["Fior di latte","Zucchine","Salmone affumicato","Limone grattugiato"]', 1764750722921);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('eb276c92-77ef-4fc4-89e2-fea79f02ed23', N'["Provola affumicata","Salsiccia fresca","Friarielli","Peperoncino fresco"]', 1764750722927);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('a360d8d3-e076-4cbc-bf9b-a50ea4ec3009', N'["Taleggio","Radicchio","Noci","Miele di acacia"]', 1764750722934);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('73e426bb-1a11-4cd5-b3b7-518e76eefec3', N'["Pomodoro San Marzano","Mozzarella di bufala","Pesto di basilico"]', 1764750722940);
INSERT INTO Combinations (id, ingredients, createdAt)
VALUES ('66649922-f1cd-4d55-83d8-05c8c152763c', N'["Funghi porcini","Salsiccia fresca","Tartufo nero"]', 1764750722947);
GO

