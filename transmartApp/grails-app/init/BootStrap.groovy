import grails.plugin.springsecurity.SecurityFilterPosition
import grails.plugin.springsecurity.SpringSecurityUtils
import grails.util.Environment
import org.grails.core.exceptions.GrailsConfigurationException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext
import org.springframework.core.io.ResourceLoader

class BootStrap {

    final static logger = LoggerFactory.getLogger(this)

    def securityContextPersistenceFilter

    def grailsApplication

    def OAuth2SyncService

    def init = { servletContext ->
        securityContextPersistenceFilter.forceEagerSessionCreation = true

        SpringSecurityUtils.clientRegisterFilter('concurrentSessionFilter', SecurityFilterPosition.CONCURRENT_SESSION_FILTER)

        if (grailsApplication.config.org.transmart.security.samlEnabled) {
            SpringSecurityUtils.clientRegisterFilter(
                    'metadataGeneratorFilter', SecurityFilterPosition.FIRST)
            SpringSecurityUtils.clientRegisterFilter(
                    'samlFilter', SecurityFilterPosition.BASIC_AUTH_FILTER)
        }

        if (!grailsApplication.config.org.transmart.configFine.is(true)) {
            logger.error("Something wrong happened parsing the externalized " +
                    "Config.groovy, because we could not find the " +
                    "configuration setting 'org.transmart.configFine " +
                    "set to true.\n" +
                    "Tip: on ~/.grails/transmartConfig, run\n" +
                    "groovy -e 'new ConfigSlurper().parse(new File(\"Config.groovy\").toURL())'\n" +
                    "to detect compile errors. Other errors can be detected " +
                    "with a breakpoing on the catch block in ConfigurationHelper::mergeInLocations().\n" +
                    "Alternatively, you can change the console logging settings by editing " +
                    "\$GRAILS_HOME/scripts/log4j.properties, adding a proper appender and log " +
                    "org.codehaus.groovy.grails.commons.cfg.ConfigurationHelper at level WARN")
            throw new GrailsConfigurationException("Configuration magic setting not found")
        }

        fixupConfig()

        // force marshaller registrar initialization
        grailsApplication.mainContext.getBean 'marshallerRegistrarService'

        if ('clientCredentialsAuthenticationProvider' in
                grailsApplication.config.grails.plugin.springsecurity.providerNames) {
            OAuth2SyncService.syncOAuth2Clients()
        }
    }

    private void fixupConfig() {
        def c = grailsApplication.config
        def val

        /* rScriptDirectory */
        val = c.com.recomdata.transmart.data.export.rScriptDirectory
        if (val) {
            logger.warn("com.recomdata.transmart.data.export.rScriptDirectory " +
                    "should not be explicitly set, value '$val' ignored")
        }

        def ctx = grailsApplication.getMainContext()
        def tsAppRScriptsDir
        if (Environment.current == Environment.PRODUCTION) {
            tsAppRScriptsDir = ctx.getResource("WEB-INF/dataExportRScripts").getFile()
        }
        else {
            tsAppRScriptsDir = new File("src/main/resources/dataExportRScripts")
        }

        if (!tsAppRScriptsDir || !tsAppRScriptsDir.isDirectory()) {
            if (!tsAppRScriptsDir || !tsAppRScriptsDir.isDirectory()) {
                throw new RuntimeException('Could not determine proper for ' +
                        'com.recomdata.transmart.data.export.rScriptDirectory')
            }
        }
        c.com.recomdata.transmart.data.export.rScriptDirectory = tsAppRScriptsDir.canonicalPath

        logger.info("com.recomdata.transmart.data.export.rScriptDirectory = " +
                "${c.com.recomdata.transmart.data.export.rScriptDirectory}")
        def f = ctx.getResource('WEB-INF/Rscripts').getFile()
        if (!f || !f.isDirectory()) {
            f = ctx.getResource('classpath:Rscripts').getFile()
        }
        c.RModules.pluginScriptDirectory = f.absolutePath

        logger.info("RModules.pluginScriptDirectory = " +
                "${c.RModules.pluginScriptDirectory}")

        // At this point we assume c.RModules exists
        if (!c.RModules.containsKey("host")) {
            c.RModules.host = "127.0.0.1"
            logger.info("RModules.host fixed to localhost")
        }
        if (!c.RModules.containsKey("port")){
            c.RModules.port = 6311
            logger.info("RModules.port fixed to default")
        }

        // Making sure we have default timeout and heartbeat values
        // At this point we assume c.recomdata exists
        if (!c.com.recomdata.containsKey("sessionTimeout"))
            c.com.recomdata.sessionTimeout = 3600
        if (!c.com.recomdata.containsKey("heartbeatLaps"))
            c.com.recomdata.heartbeatLaps = 60
    }


    def destroy = {
    }
}
