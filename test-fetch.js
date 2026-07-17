async function test() {
  const r = await fetch('https://painel.btzap.com.br/cliente/docs?group=instance');
  const t = await r.text();
  const d = t.indexOf('id="disconnect"');
  console.log(t.substring(d, d+2000));
  const l = t.indexOf('id="logout"');
  console.log('\n\n---LOGOUT---\n\n' + t.substring(l, l+2000));
}
test();
