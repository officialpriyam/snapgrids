module.exports = {
    name: 'LuckPerms',
    description: 'LuckPerms is a permissions plugin for Minecraft servers. It allows server admins to control what features players can use by creating groups and assigning permissions.',
    pluginId: 'LuckPerms',
    mavenIntegration: `
        <repositories>
            // MAVEN CENTRAL REPOSITORY
        </repositories>
        <dependencies>
            <dependency>
                <groupId>net.luckperms</groupId>
                <artifactId>api</artifactId>
                <version>5.4</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
};