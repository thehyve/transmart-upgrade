import groovy.sql.Sql

import java.sql.Connection
import java.sql.DriverManager

import static java.lang.System.getenv

@GrabConfig(systemClassLoader = true)
@Grab('org.postgresql:postgresql:9.3-1100-jdbc4')

String host = getenv('PGHOST')
if(!host || host == '/tmp') {
    host = 'localhost'
}
String url = "jdbc:postgresql://${host}:${getenv('PGPORT')}/${getenv('PGDATABASE')}"
Connection connection = DriverManager.getConnection(url,
        getenv('PGUSER'),
        getenv('PGPASSWORD'))

def sql = new Sql(connection)

List<String> tables = []
System.in.eachLine { String line ->
    def (table, file) = line.split('\t')
    if (!tables.contains(table)) {
        tables << table
    }
}
tables.reverse().each { String table ->
    println "Deleting ${table}"
    sql.executeUpdate('DELETE FROM ' + table)
}
