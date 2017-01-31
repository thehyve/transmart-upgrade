package com.recomdata.grails.plugin.gwas
/*************************************************************************
 * tranSMART - translational medicine data mart
 * 
 * Copyright 2008-2012 Janssen Research & Development, LLC.
 * 
 * This product includes software developed at Janssen Research & Development, LLC.
 * 
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License 
 * as published by the Free Software  * Foundation, either version 3 of the License, or (at your option) any later version, along with the following terms:
 * 1.	You may convey a work based on this program in accordance with section 5, provided that you retain the above notices.
 * 2.	You may convey verbatim copies of this program code as you receive it, in any medium, provided that you retain the above notices.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS    * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *
 ******************************************************************/
  

/**
 * $Id: BioAssayAnalysisData.groovy 9178 2011-08-24 13:50:06Z mmcduffie $
 * @author $Author: mmcduffie $
 * @version $Revision: 9178 $
 */



import com.recomdata.util.IExcelProfile
import org.transmart.biomart.BioAssayAnalysisPlatform

class BioAssayAnalysisGwas implements IExcelProfile {

	BioAssayAnalysisPlatform analysis
	String rsId
	Double pValue
	Double logPValue
	Long etlId
	Long id
	String ext_data
	Double beta
	Double standardError
	String effectAllele
	String otherAllele
	String passFail
	
	static mapping = {
	 table name:'BIO_ASSAY_ANALYSIS_GWAS', schema:'BIOMART'
	 version false
	 id generator:'sequence', params:[sequence:'SEQ_BIO_DATA_ID']
	 columns {
		 id column:'BIO_ASY_ANALYSIS_GWAS_ID'
		 analysis column:'BIO_ASSAY_ANALYSIS_ID'
		 rsId column:'RS_ID'
		 pValue column:'P_VALUE'
		 logPValue column:'LOG_P_VALUE'
		 etlId column:'ETL_ID'
		 ext_data column:'EXT_DATA'
		 beta column: 'BETA'
		 standardError column: 'STANDARD_ERROR'
		 effectAllele column: 'EFFECT_ALLELE'
		 otherAllele column: 'OTHER_ALLELE' 
		 passFail column: 'PASS_FAIL'
		}
	}

	/**
	 * Get values to Export to Excel
	 */
	public List getValues() {
		return [rsId, pValue, logPValue]
	}
}