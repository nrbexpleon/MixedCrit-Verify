const CRIT={QM:0,'ASIL-A':1,'ASIL-B':2,'ASIL-C':3,'ASIL-D':4};
const REQUIRED=['CPU_STRESS','MEMORY_PRESSURE','NETWORK_SATURATION','PARTITION_RESTART','FAULT_INJECTION'];
const id=(campaignId,kind,source,target)=>`${campaignId}:${kind}:${source}:${target}`;
export function validateProject(x){const e=[];for(const k of ['name','owner','computePlatform','hypervisor'])if(!x?.[k]?.trim())e.push(`${k} is required.`);return e}
export function validatePartition(x){const e=[];for(const k of ['name','criticality'])if(!x?.[k]?.trim())e.push(`${k} is required.`);if(!(x?.criticality in CRIT))e.push('Valid criticality is required.');for(const k of ['cpuBudgetPct','memoryBudgetMb','deadlineMs'])if(Number(x?.[k])<=0)e.push(`${k} must be positive.`);return e}
export function generateCases(project,campaign){
 const targets=project.partitions.filter(p=>campaign.targetIds.includes(p.id));const aggressors=project.partitions.filter(p=>campaign.aggressorIds.includes(p.id));const cases=[];
 for(const target of targets)for(const source of aggressors){
  for(const kind of campaign.kinds){const critical=CRIT[target.criticality]>=2||kind==='PARTITION_ESCAPE';cases.push({id:id(campaign.id,kind,source.id,target.id),kind,sourceId:source.id,targetId:target.id,name:`${kind.replaceAll('_',' ')}: ${source.name} → ${target.name}`,critical,expected:`${target.name} remains within CPU, memory, deadline and error-containment budgets`})}
 }
 return cases;
}
export function evaluateRun(project,campaign,run){
 const cases=campaign.cases||[],byId=new Map((run.results||[]).map(r=>[r.caseId,r])),partitions=new Map(project.partitions.map(p=>[p.id,p]));let passed=0,failed=0,notRun=0;const findings=[];
 const evaluated=cases.map(c=>{const r=byId.get(c.id),target=partitions.get(c.targetId);let status=r?.status||'NOT_RUN',reasons=[];if(!r){reasons.push('No result recorded');notRun++}else{
   if(status==='PASSED'){
    if(Number(r.cpuPeakPct)>Number(target.cpuBudgetPct)){status='FAILED';reasons.push(`CPU ${r.cpuPeakPct}% > ${target.cpuBudgetPct}% budget`)}
    if(Number(r.memoryPeakMb)>Number(target.memoryBudgetMb)){status='FAILED';reasons.push(`Memory ${r.memoryPeakMb} MB > ${target.memoryBudgetMb} MB budget`)}
    if(Number(r.worstLatencyMs)>Number(target.deadlineMs)){status='FAILED';reasons.push(`Latency ${r.worstLatencyMs} ms > ${target.deadlineMs} ms deadline`)}
    if(Number(r.errorPropagation||0)>0){status='FAILED';reasons.push('Error propagation observed')}
   }
   if(status==='PASSED')passed++;else{failed++;if(!reasons.length)reasons.push(r.notes||'Recorded failure')}
  }
  return{...c,status,reasons,cpuPeakPct:r?.cpuPeakPct??null,memoryPeakMb:r?.memoryPeakMb??null,worstLatencyMs:r?.worstLatencyMs??null,errorPropagation:r?.errorPropagation??null,evidenceRef:r?.evidenceRef||''}
 });
 const criticalFailures=evaluated.filter(c=>c.critical&&c.status!=='PASSED');if(criticalFailures.length)findings.push({severity:'critical',title:`${criticalFailures.length} critical isolation cases failed or were not run`,action:'Resolve the interference path and repeat the controlled campaign.'});
 if(notRun)findings.push({severity:'high',title:`${notRun} cases were not run`,action:'Execute every generated case and attach reproducible evidence.'});
 const present=[...new Set(cases.map(c=>c.kind))],missing=campaign.kinds.filter(k=>!present.includes(k));if(missing.length)findings.push({severity:'high',title:'Campaign categories are missing',action:`Regenerate missing categories: ${missing.join(', ')}`});
 const affectedTargets=[...new Set(evaluated.filter(c=>c.status==='FAILED').map(c=>c.targetId))];const passRate=cases.length?Math.round(passed/cases.length*100):0;const decision=criticalFailures.length||notRun||failed?'ISOLATION_NOT_DEMONSTRATED':passRate===100?'CANDIDATE_FOR_SAFETY_REVIEW':'REVIEW_REQUIRED';
 return{generatedAt:new Date().toISOString(),decision,summary:{total:cases.length,passed,failed,notRun,passRate,criticalFailures:criticalFailures.length,affectedTargets:affectedTargets.length},cases:evaluated,findings,disclaimer:'Recorded-result decision support only. This does not certify freedom from interference or ISO 26262 compliance.'};
}
export function projectAssessment(p){const findings=[];if(!(p.partitions||[]).length)findings.push({severity:'high',title:'No partitions defined',action:'Model all safety and non-safety workloads.'});if((p.partitions||[]).length<2)findings.push({severity:'high',title:'Mixed-criticality interaction cannot be assessed',action:'Define at least two workloads with different criticality or trust.'});if(!(p.channels||[]).length)findings.push({severity:'medium',title:'No shared-resource channels defined',action:'Record shared CPU, memory, network, storage, devices and IPC.'});if(!(p.campaigns||[]).length)findings.push({severity:'high',title:'No interference campaign generated',action:'Generate a campaign for safety-relevant targets.'});const latest=p.runs?.at(-1)?.evaluation;return{status:latest?.decision||(findings.some(x=>x.severity==='high')?'GAPS_IDENTIFIED':'IN_PROGRESS'),metrics:{partitions:p.partitions?.length||0,channels:p.channels?.length||0,campaigns:p.campaigns?.length||0,runs:p.runs?.length||0,evidence:p.evidence?.length||0,reviews:p.reviews?.length||0},findings,latestRun:latest||null}}
export{REQUIRED};
