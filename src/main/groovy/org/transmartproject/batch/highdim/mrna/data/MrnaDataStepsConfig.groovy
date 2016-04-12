package org.transmartproject.batch.highdim.mrna.data

import org.springframework.batch.core.Step
import org.springframework.batch.core.configuration.annotation.JobScope
import org.springframework.batch.core.scope.context.JobSynchronizationManager
import org.springframework.batch.core.step.tasklet.Tasklet
import org.springframework.batch.item.ItemWriter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.transmartproject.batch.beans.JobScopeInterfaced
import org.transmartproject.batch.clinical.db.objects.Sequences
import org.transmartproject.batch.clinical.db.objects.Tables
import org.transmartproject.batch.db.DatabaseImplementationClassPicker
import org.transmartproject.batch.db.DbConfig
import org.transmartproject.batch.db.DeleteByColumnValueWriter
import org.transmartproject.batch.db.PostgresPartitionTasklet
import org.transmartproject.batch.db.oracle.OraclePartitionTasklet
import org.transmartproject.batch.highdim.beans.AbstractTypicalHdDataStepsConfig
import org.transmartproject.batch.highdim.datastd.TripleStandardDataValue
import org.transmartproject.batch.startup.StudyJobParametersModule

/**
 * Spring context for mRNA data loading steps.
 */
@Configuration
@ComponentScan
@Import(DbConfig)
class MrnaDataStepsConfig extends AbstractTypicalHdDataStepsConfig {

    @Autowired
    DatabaseImplementationClassPicker picker

    @Bean
    @Override
    ItemWriter getDeleteCurrentDataWriter() {
        new DeleteByColumnValueWriter<Long>(
                table: Tables.MRNA_DATA,
                column: 'assay_id',
                entityName: 'mrna data points')
    }

    @Bean
    Step partitionDataTable() {
        stepOf('partitionDataTable', partitionTasklet())
    }

    @Bean
    @Override
    @JobScope
    MrnaDataWriter getDataWriter() {
        new MrnaDataWriter()
    }

    @Bean
    @JobScopeInterfaced
    Tasklet partitionTasklet() {
        String studyId = JobSynchronizationManager.context
                .jobParameters[StudyJobParametersModule.STUDY_ID]
        assert studyId != null

        switch (picker.pickClass(PostgresPartitionTasklet, OraclePartitionTasklet)) {
            case PostgresPartitionTasklet:
                return new PostgresPartitionTasklet(
                        tableName: Tables.MRNA_DATA,
                        partitionByColumn: 'trial_name',
                        partitionByColumnValue: studyId,
                        sequence: Sequences.MRNA_PARTITION_ID,
                        primaryKey: ['assay_id', 'probeset_id'])
            case OraclePartitionTasklet:
                return new OraclePartitionTasklet(
                        tableName: Tables.MRNA_DATA,
                        partitionByColumnValue: studyId)
            default:
                throw new IllegalStateException('No supported DBMS detected.')
        }

    }
}
