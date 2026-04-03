const MongoSql = require("./MongoSql");

const queries = [
`
    CREATE TABLE articles (
  id int(11) NOT NULL,
  title varchar(255) NOT NULL,
  caption int(11) DEFAULT NULL,
  content text NOT NULL,
  created_at datetime NOT NULL,
  created_by int(11) NOT NULL,
  modified_at datetime NOT NULL,
  modified_by int(11) NOT NULL,
  reading int(11) NOT NULL DEFAULT 0,
  likes int(11) NOT NULL DEFAULT 0,
  dislikes int(11) NOT NULL DEFAULT 0,
  category int(11) NOT NULL,
  branch int(11) NOT NULL,
  post_on datetime NOT NULL
)
`,
`
CREATE TABLE articles_pictures (
  id int(11) NOT NULL,
  img int(11) NOT NULL,
  article int(11) NOT NULL
) 
`,
`
CREATE TABLE branch (
  id int(11) NOT NULL,
  domain varchar(255) NOT NULL,
  created_at datetime NOT NULL
) 
`,
`
CREATE TABLE category (
  id int(11) NOT NULL,
  name varchar(255) NOT NULL,
  attached_to enum('A','P') NOT NULL,
  created_at datetime NOT NULL,
  created_by int(11) NOT NULL,
  modified_at datetime NOT NULL,
  modified_by int(11) NOT NULL,
  branch int(11) NOT NULL
) 
`,
`
CREATE TABLE client_snapshot (
  id int(11) NOT NULL,
  file text NOT NULL,
  created_at datetime NOT NULL
) 
`,
`
CREATE TABLE communauty (
  id int(11) NOT NULL,
  branch int(11) NOT NULL,
  manager int(11) NOT NULL
) 
`,
`
CREATE TABLE mailing (
  id int(11) NOT NULL,
  client int(11) NOT NULL,
  object varchar(255) NOT NULL,
  body text NOT NULL,
  created_at datetime NOT NULL,
  post_on datetime NOT NULL,
  posted_by int(11) NOT NULL
) 
`,
`
CREATE TABLE manager (
  id int(11) NOT NULL,
  firstname varchar(255) NOT NULL,
  lastname varchar(255) NOT NULL,
  mail varchar(255) UNIQUE NOT NULL,
  access text NOT NULL,
  code text NOT NULL,
  nickname varchar(255) UNIQUE NOT NULL,
  phone varchar(255) NOT NULL,
  created_at datetime NOT NULL,
  created_by int(11) DEFAULT NULL,
  active set('0','1') NOT NULL
) 
`,
`
CREATE TABLE messenging (
  id int(11) NOT NULL,
  firstname varchar(255) NOT NULL,
  lastname varchar(255) NOT NULL,
  client int(11) NOT NULL,
  message text NOT NULL,
  post_on datetime NOT NULL,
  read_by int(11) DEFAULT NULL
) 
`,
`
CREATE TABLE pictures (
  id int(11) NOT NULL,
  path text NOT NULL,
  created_at datetime NOT NULL,
  created_by int(11) NOT NULL
) 
`,
`
CREATE TABLE punchlines (
  id int(11) NOT NULL,
  presentation int(11) NOT NULL,
  picture int(11) NOT NULL,
  title varchar(255) NOT NULL,
  artist varchar(255) NOT NULL,
  lyrics text DEFAULT NULL,
  punchline text NOT NULL,
  year int(11) NOT NULL,
  category int(11) NOT NULL,
  comment text DEFAULT NULL,
  created_at datetime NOT NULL,
  created_by int(11) NOT NULL,
  modified_at datetime NOT NULL,
  modified_by int(11) NOT NULL,
  post_on datetime NOT NULL,
  branch int(11) NOT NULL
) 
`,
`
CREATE TABLE session_trace (
  client int(11) NOT NULL,
  token text NOT NULL,
  created_at datetime NOT NULL,
  last_seen datetime NOT NULL
) 
`,
`
CREATE TABLE subscriber (
  id int(11) NOT NULL,
  mail varchar(255) NOT NULL,
  contact int(11) NOT NULL,
  news int(11) NOT NULL,
  created_at datetime NOT NULL,
  branch int(11) NOT NULL
)
`,
`
CREATE TABLE sys_pref (
  metadata varchar(255) NOT NULL,
  content text NOT NULL
) 
`
];

async function initializeDatabase(){
    const mg = new MongoSql();
    for(let table of queries){
        await mg.exec(table);
    }
}

module.exports = initializeDatabase;