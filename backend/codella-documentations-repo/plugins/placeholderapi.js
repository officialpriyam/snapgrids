module.exports = {
    name: 'PlaceholderAPI',
    description: 'PlaceholderAPI is a plugin for Spigot servers that allows server owners to display information from various plugins with a uniform format.',
    pluginId: 'PlaceholderAPI',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>placeholderapi</id>
                <url>https://repo.extendedclip.com/content/repositories/placeholderapi/</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>me.clip</groupId>
                <artifactId>placeholderapi</artifactId>
                <version>2.11.6</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `
};