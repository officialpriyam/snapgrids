module.exports = {
    name: 'PlayerPoints',
    description: 'PlayerPoints is a simple and efficient currency plugin, adding the ability to manage points for players. Its features can be used by plugins that directly support PlayerPoints, or optionally through Vault.',
    pluginId: 'PlayerPoints',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>rosewood-repo</id>
                <url>https://repo.rosewooddev.io/repository/public/</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>org.black_ixx</groupId>
                <artifactId>playerpoints</artifactId>
                <version>3.3.2</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    `,
    usage: `
        Getting an API instance
        In order to use the API, you must first acquire an API instance. An example plugin class that does this can be found below.
        
        
        import org.black_ixx.PlayerPointsAPI;
        import org.bukkit.Bukkit;
        import org.bukkit.plugin.java.JavaPlugin;
        
        public class Example extends JavaPlugin {
            private PlayerPointsAPI ppAPI;
        
            @Override
            public void onEnable() {
                if (Bukkit.getPluginManager().isPluginEnabled("PlayerPoints")) {
                    this.ppAPI = PlayerPoints.getInstance().getAPI();
                }
        
                // When you want to access the API, check if the instance is null
                if (this.ppAPI != null) {
                    // Do stuff with the API here
                }
            }
        }
        
        PlayerPointsAPI class:
        Instance Methods
        boolean give(@NotNull UUID playerId, int amount)
        boolean giveAll(@NotNull Collection<UUID> playerIds, int amount) (annotated with @NotNull)
        boolean take(@NotNull UUID playerId, int amount)
        int look(@NotNull UUID playerId)
        String lookFormatted(@NotNull UUID playerId)
        String lookShorthand(@NotNull UUID playerId)
        boolean pay(@NotNull UUID source, @NotNull UUID target, int amount)
        boolean set(@NotNull UUID playerId, int amount)
        boolean reset(@NotNull UUID playerId)
        List<org.black_ixx.playerpoints.models.SortedPlayer> getTopSortedPoints(int limit)
        List<org.black_ixx.playerpoints.models.SortedPlayer> getTopSortedPoints()
        UUID getAccountUUIDByName(@NotNull String name)
`
};