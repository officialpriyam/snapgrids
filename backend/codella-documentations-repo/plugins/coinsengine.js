module.exports = {
    name: 'CoinsEngine',
    description: 'CoinsEngine is a lightweight, highly customizable custom currency provider with built-in Vault integration.',
    pluginId: 'CoinsEngine',
    mavenIntegration: `
        <repositories>
            <repository>
              <id>nightexpress-releases</id>
              <url>https://repo.nightexpressdev.com/releases</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
              <groupId>su.nightexpress.coinsengine</groupId>
              <artifactId>CoinsEngine</artifactId>
              <version>2.4.2</version>
            </dependency>
        </dependencies>
    `,
    usage: `
        CoinsEngineAPI class: su.nightexpress.coinsengine.api
        Static Methods
        static void load(@NotNull su.nightexpress.coinsengine.CoinsEnginePlugin plugin)
        static void unload()
        static su.nightexpress.coinsengine.data.UserManager getUserManager() (annotated with @NotNull)
        static su.nightexpress.coinsengine.currency.CurrencyManager getCurrencyManager() (annotated with @NotNull)
        static su.nightexpress.coinsengine.api.currency.Currency getCurrency(@NotNull String id) (nullable)
        static boolean hasCurrency(@NotNull String id)
        static void regsiterCurrency(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency)
        static double getBalance(@NotNull Player player, @NotNull su.nightexpress.coinsengine.api.currency.Currency currency)
        static double getBalance(@NotNull UUID playerId, @NotNull su.nightexpress.coinsengine.api.currency.Currency currency)
        static double getBalance(@NotNull UUID playerId, @NotNull String currencyName)
        static void addBalance(@NotNull Player player, @NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        static void setBalance(@NotNull Player player, @NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        static void removeBalance(@NotNull Player player, @NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        static boolean addBalance(@NotNull UUID playerId, @NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        static boolean setBalance(@NotNull UUID playerId, @NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        static boolean removeBalance(@NotNull UUID playerId, @NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        static boolean addBalance(@NotNull UUID playerId, @NotNull String currencyName, double amount)
        static boolean setBalance(@NotNull UUID playerId, @NotNull String currencyName, double amount)
        static boolean removeBalance(@NotNull UUID playerId, @NotNull String currencyName, double amount)
        static boolean editBalance(@NotNull Supplier<su.nightexpress.coinsengine.data.impl.CoinsUser> supplier, @NotNull Consumer<su.nightexpress.coinsengine.data.impl.CoinsUser> consumer) (private)
        static su.nightexpress.coinsengine.data.impl.CoinsUser getUserData(@NotNull Player player) (annotated with @NotNull)
        static su.nightexpress.coinsengine.data.impl.CoinsUser getUserData(@NotNull String name) (nullable)
        static su.nightexpress.coinsengine.data.impl.CoinsUser getUserData(@NotNull UUID uuid) (nullable)
        static CompletableFuture<su.nightexpress.coinsengine.data.impl.CoinsUser> getUserDataAsync(@NotNull String name) (annotated with @NotNull)
        static CompletableFuture<su.nightexpress.coinsengine.data.impl.CoinsUser> getUserDataAsync(@NotNull UUID uuid) (annotated with @NotNull)
 
        Currency class: su.nightexpress.coinsengine.api.currency
        Default Methods
        default UnaryOperator<String> replacePlaceholders() (annotated with @NotNull)
        default su.nightexpress.nightcore.language.message.LangMessage withPrefix(@NotNull su.nightexpress.nightcore.language.message.LangMessage message) (annotated with @NotNull)
        default boolean isUnlimited()
        default boolean isLimited()
        default boolean isInteger()
        default boolean isUnderLimit(double value)
        default double fine(double amount)
        default double limit(double amount)
        default double fineAndLimit(double amount)
        default double getExchangeRate(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency)
        default double getExchangeRate(@NotNull String id)
        default String getPermission() (annotated with @NotNull)
        default String formatValue(double balance) (annotated with @NotNull)
        default String format(double balance) (annotated with @NotNull)
        default su.nightexpress.nightcore.util.number.CompactNumber formatCompactValue(double balance) (annotated with @NotNull)
        default String formatCompact(double balance) (annotated with @NotNull)
        
        Abstract Methods
        String getId() (annotated with @NotNull)
        String getName() (annotated with @NotNull)
        void setName(@NotNull String name)
        String getPrefix() (annotated with @NotNull)
        void setPrefix(@NotNull String prefix)
        String getSymbol() (annotated with @NotNull)
        void setSymbol(@NotNull String symbol)
        String getFormat() (annotated with @NotNull)
        void setFormat(@NotNull String format)
        String getFormatShort() (annotated with @NotNull)
        void setFormatShort(@NotNull String formatShort)
        String[] getCommandAliases() (annotated with @NotNull)
        void setCommandAliases(String... commandAliases)
        String getColumnName() (annotated with @NotNull)
        void setColumnName(@NotNull String columnName)
        su.nightexpress.nightcore.db.sql.column.Column getColumn() (annotated with @NotNull)
        ItemStack getIcon() (annotated with @NotNull)
        void setIcon(@NotNull ItemStack icon)
        boolean isDecimal()
        void setDecimal(boolean decimal)
        boolean isPermissionRequired()
        void setPermissionRequired(boolean permissionRequired)
        boolean isSynchronizable()
        void setSynchronizable(boolean synchronizable)
        boolean isTransferAllowed()
        void setTransferAllowed(boolean transferAllowed)
        double getMinTransferAmount()
        void setMinTransferAmount(double minTransferAmount)
        double getStartValue()
        void setStartValue(double startValue)
        double getMaxValue()
        void setMaxValue(double maxValue)
        boolean isVaultEconomy()
        void setVaultEconomy(boolean vaultEconomy)
        boolean isExchangeAllowed()
        void setExchangeAllowed(boolean exchangeAllowed)
        Map<String, Double> getExchangeRates() (annotated with @NotNull)
        
        CoinsUser class: su.nightexpress.coinsengine.data.impl
        Instance Methods
        Map<String, Double> getBalanceMap() (annotated with @NotNull)
        Map<String, su.nightexpress.coinsengine.data.impl.CurrencySettings> getSettingsMap() (annotated with @NotNull)
        void resetBalance()
        void resetBalance(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency)
        double getBalance(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency)
        void addBalance(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        void removeBalance(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        void setBalance(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount)
        void changeBalance(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency, double amount) (private)
        su.nightexpress.coinsengine.data.impl.CurrencySettings getSettings(@NotNull su.nightexpress.coinsengine.api.currency.Currency currency) (annotated with @NotNull)
`
};