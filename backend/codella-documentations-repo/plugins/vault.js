module.exports = {
    name: 'Vault',
    description: 'Vault is a Permissions, Chat, & Economy API to give plugins easy hooks into these systems without needing to hook or depend on each individual plugin themselves. It was born out of a distaste for how both Register and the current Permissions API are run, and their lack of features or over-complicated implementations. Vault attempts to solve these issues by being intuitive and providing plugins with support for any system that they may use.',
    pluginId: 'Vault',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>jitpack.io</id>
                <url>https://jitpack.io</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>com.github.MilkBowl</groupId>
                <artifactId>VaultAPI</artifactId>
                <version>1.7</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `
};