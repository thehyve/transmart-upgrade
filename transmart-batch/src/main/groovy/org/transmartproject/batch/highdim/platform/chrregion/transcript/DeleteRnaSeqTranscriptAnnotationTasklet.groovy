package org.transmartproject.batch.highdim.platform.chrregion.transcript

import org.springframework.batch.core.StepContribution
import org.springframework.batch.core.scope.context.ChunkContext
import org.springframework.batch.core.step.tasklet.Tasklet
import org.springframework.batch.repeat.RepeatStatus
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Component
import org.transmartproject.batch.beans.JobScopeInterfaced
import org.transmartproject.batch.clinical.db.objects.Tables
import org.transmartproject.batch.highdim.platform.Platform

/**
 * Removes data from de_rnaseq_transcript_annotation
 */
@Component
@JobScopeInterfaced
class DeleteRnaSeqTranscriptAnnotationTasklet implements Tasklet {

    @Autowired
    Platform platform

    @Autowired
    NamedParameterJdbcTemplate jdbcTemplate

    @Override
    RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        int i = jdbcTemplate.update("""
                DELETE FROM ${Tables.RNASEQ_TRANSCRIPT_ANNOTATION}
                WHERE gpl_id = :gpl_info
        """, [gpl_info: platform.id])

        contribution.incrementWriteCount(i)
    }
}
