module.exports = {
    name: 'EdLicense',
    description: 'EdLicense is a library which allows you to add a license to your plugin.',
    mavenIntegration: `
        <repositories>
            <repository>
              <id>edlicense-repo</id>
              <url>https://repo.edlicense.com/repository/maven-releases/</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
              <groupId>com.edwardbelt</groupId>
              <artifactId>edlicense</artifactId>
              <version>1.1</version>
              <scope>compile</scope>
            </dependency>
        </dependencies>
    `,
    mavenShade: `
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.4.1</version>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <minimizeJar>true</minimizeJar>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    `,
    usage: `
        Once you have added the repo and the dependency into your pom.xml, now it's time to implement it into your code.
        On your main class, import the following static function:
        
        import static com.edwardbelt.edlicense.Main.checkLicense;
        And now on your onEnable, put the following code. The pluginId can be found in the EdLicense dashboard URL when a plugin is selected or inside your Plugin Settings.
        
        if(!checkLicense("YOUR-PLUGIN-ID", config.getString("license"))) {
            Bukkit.getLogger().warning("You are using an invalid license!");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }
        
        The license is usually stored in your config.yml file.
        
        So, if the license is invalid or it has expired or it has reached the maximum amounts of IP addresses it will return false on checkLicense method.
        
        Once you've set up EdLicense, tell the user to send you their EdLicense dashboard plugin ID or to manually set them inside the file you've set it up.
    `
};