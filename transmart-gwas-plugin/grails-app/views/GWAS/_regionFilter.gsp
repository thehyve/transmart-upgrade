
<div id="regionFilterHelp" style="float: right;">
	<tmpl:/GWAS/helpIcon id="1302"/>
</div>
<div><b>Filter by:</b></div>
<br/>
<div onclick="jQuery('[name=\'regionFilter\'][value=\'gene\']').attr('checked', true);">
<g:radio name="regionFilter" value="gene"/> 
Gene/RSID: <tmpl:/GWAS/extTagSearchField width="100" fieldName="filterGeneId" searchAction="searchAutoComplete" searchController="GWAS" />
<br/><br/> <br/>
Use: <g:select name="filterGeneUse" from="${['19':'HG19','18':'HG18']}" optionKey="${{it.key}}" optionValue="${{it.value}}"/>
<br/><br/>
Location: 
<g:select name="filterGeneRange" from="${ranges}" optionKey="${{it.key}}" optionValue="${{it.value}}"/> <g:textField name="filterGeneBasePairs" style="width: 50px"/> base pairs</div>

<br/>
<hr/>
<br/>

<div onclick="jQuery('[name=\'regionFilter\'][value=\'chromosome\']').attr('checked', true);">
<g:radio name="regionFilter" value="chromosome"/> 
Chromosome: <g:select name="filterChromosomeNumber" from="${1..23}"/> 
Use: <g:select name="filterChromosomeUse" from="${['19':'HG19','18':'HG18']}" optionKey="${{it.key}}" optionValue="${{it.value}}"/>
<br/><br/>
Position: 
<g:textField name="filterChromosomePosition" style="width: 100px"/>
<g:select name="filterChromosomeRange" from="${ranges}" optionKey="${{it.key}}" optionValue="${{it.value}}"/> <g:textField name="filterChromosomeBasePairs" style="width: 50px"/> base pairs</div>
<br/>
<hr/>
<br/>
P-Value: <g:textField name="pValue"  />
