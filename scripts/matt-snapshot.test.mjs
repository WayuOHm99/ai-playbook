// Integrity CLI regressions use generated source files only; never execute source skills.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {copyFileSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const scripts=dirname(fileURLToPath(import.meta.url));
function fixture() {
 const parent=resolve(scripts,'../.scratch/matt-snapshot-tests'); mkdirSync(parent,{recursive:true});
 const root=mkdtempSync(join(parent,'run-')); mkdirSync(join(root,'scripts'));
 copyFileSync(join(scripts,'check-matt-snapshot.mjs'),join(root,'scripts/check-matt-snapshot.mjs'));
 const manifest={schemaVersion:1,snapshotType:'repo-only-reference',sourceRepository:'https://github.com/mattpocock/skills',sourceCommit:'a'.repeat(40),packageVersion:'1.3.1',skillCount:38,primarySkillCount:27,referenceSkillCount:11,fileCount:38,skills:[],files:[]};
 for(let i=0;i<38;i++) {
  const category=i<20?'engineering':i<27?'productivity':i<34?'in-progress':'misc';
  const name='demo-'+i,path=`skills/${category}/${name}/SKILL.md`;
  const data=Buffer.from(`---\nname: ${name}\ndescription: Synthetic source.\n---\n`);
  const dest=join(root,'upstream/matt-pocock/source',path);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,data);
  manifest.skills.push({name,path,category});manifest.files.push({path,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),gitBlob:createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex')});
 }
 const save=()=>writeFileSync(join(root,'upstream/matt-pocock/manifest.json'),JSON.stringify(manifest));save();
 const run=()=>spawnSync(process.execPath,[join(root,'scripts/check-matt-snapshot.mjs')],{encoding:'utf8'});
 return {root,manifest,save,run};
}
test('accepts all 27 primary and 11 reference skill categories',()=>{
 const f=fixture(),r=f.run();assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).skills,38);
});
test('fails closed on byte drift and an unexpected inventory file',()=>{
 const f=fixture(),path=join(f.root,'upstream/matt-pocock/source',f.manifest.files[0].path);
 const original=readFileSync(path);writeFileSync(path,'changed');let r=f.run();assert.equal(r.status,1);assert.match(r.stderr,/Snapshot drift/);
 writeFileSync(path,original);writeFileSync(join(f.root,'upstream/matt-pocock/source/extra.md'),'extra');r=f.run();assert.equal(r.status,1);assert.match(r.stderr,/unexpected snapshot files/);
});
test('rejects category relabeling and wrong primary/reference counts',()=>{
 const f=fixture();f.manifest.skills[0].category='misc';f.save();let r=f.run();assert.equal(r.status,1);assert.match(r.stderr,/category/);
 f.manifest.skills[0].category='engineering';f.manifest.primarySkillCount=28;f.save();r=f.run();assert.equal(r.status,1);assert.match(r.stderr,/inventory/);
});
test('rejects traversal metadata before following its path',()=>{
 const f=fixture();f.manifest.files[0].path='../outside.md';f.save();const r=f.run();assert.equal(r.status,1);assert.match(r.stderr,/Invalid snapshot file path/);
});
