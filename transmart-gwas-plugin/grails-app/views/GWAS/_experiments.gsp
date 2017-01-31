<div class="search-result-info">
	<table><tr><td>
    Search results:&nbsp;&nbsp;${experiments.size()} 
    
    <g:if test="${experiments.size() == 1}">study</g:if>
    <g:else>studies</g:else>
    
    with ${analysisCount}&nbsp;
     
    <g:if test="${analysisCount > 1}">analyses</g:if>
    <g:else>analysis</g:else>
    
    &nbsp;in ${duration} 
    </td>
    <td style="text-align: right"><div id="selectedAnalyses">&nbsp;</div></td>
	</tr>
    </table>
</div>
<div class="search-results-table">
    <g:each in="${experiments.entrySet().sort{it.key.accession}}" status="ti" var="experimentresult">        
        <div class="${ (ti % 2) == 0 ? 'result-trial-odd' : 'result-trial-even'}" id="TrialDet_${experimentresult.key.id}_anchor">
        	<g:set var="safeTitle">${experimentresult.key.title.replace("'", "\\'")}</g:set>
            <a href="#" onclick="javascript:gwasShowDetailDialog('${createLink(controller:'experimentAnalysis',action:'expDetail',id:experimentresult.key.id)}', '${experimentresult.key.accession}: ${safeTitle}', 600);">
               <span style="display:block; float:left;">
                   <asset:image alt="" src="view_detailed.png" />
               </span>
               <span class="result-trial-name"> ${experimentresult.key.accession}</span></a>: ${experimentresult.key.title}

               <g:ifPlugin name="folder-management">
	               <span class="result-analysis-label">
		               <g:set var="ts" value="${Calendar.instance.time.time}" />
		               <a id="toggleFile_${experimentresult.key.id}" href="#" onclick="javascript:toggleFileDiv('${experimentresult.key.id}', '${createLink(controller:'fmFolder',action:'getFolderFiles',params:[id:experimentresult.key.id,trialNumber:experimentresult.key.id,unqKey:ts])}');">
		                <asset:image alt="expand/collapse" id="imgFileExpand_${experimentresult.key.id}" src="/down_arrow_small2.png" style="display: inline;"/>
		    				  Files
		               </a>
	               </span>
	               <div id="${experimentresult.key.id}_files" name="${experimentresult.key.id}" class="detailexpand"></div>
               </g:ifPlugin>


               <span class="result-analysis-label">
                   <g:set var="ts" value="${Calendar.instance.time.time}" />
                   <a id="toggleDetail_${experimentresult.key.id}" href="#" onclick="javascript:toggleDetailDiv('${experimentresult.key.id}', '${createLink(controller:'GWAS',action:'getTrialAnalysis',params:[id:experimentresult.key.id,trialNumber:experimentresult.key.id,unqKey:ts])}');">
                    <asset:image alt="expand/collapse" id="imgExpand_${experimentresult.key.id}" src="down_arrow_small2.png" style="display: inline;"/>
                          Analyses
                   </a>
               </span>
               <div id="${experimentresult.key.id}_detail" name="${experimentresult.key.id}" class="detailexpand"></div>

        </div> 
    </g:each>
</div>