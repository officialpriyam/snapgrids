module.exports = {
    name: 'Citizens',
    description: 'Citizens is the original NPC plugin, adding everything from simple player statues to walking and talking NPCs and more advanced features using addons such as guards using Sentinel, scriptable NPCs using Denizen, NPC shops and more.',
    pluginId: 'Citizens',
    mavenIntegration: `
        <repositories>
            <repository>
                <id>citizens-repo</id>
                <url>https://maven.citizensnpcs.co/repo</url>
            </repository>
        </repositories>
        <dependencies>
            <dependency>
                <groupId>net.citizensnpcs</groupId>
                <artifactId>citizens-main</artifactId>
                <version>2.0.38-SNAPSHOT</version>
                <type>jar</type>
                <scope>provided</scope>
                <exclusions>
                    <exclusion>
                        <groupId>*</groupId>
                        <artifactId>*</artifactId>
                    </exclusion>
                </exclusions>
            </dependency>
        </dependencies>
    `,
    usage: `
        Creating an NPC
        The simplest way to create an NPC is to use an NPCRegistry, which manages the storage and creation of NPCs. The default registry is given by CitizensAPI.getNPCRegistry(), and you can create new ones with different storage methods by calling other CitizensAPI methods. A Player NPC with name "fullwall" could then be created like this:
        
        NPC npc = CitizensAPI.getNPCRegistry().createNPC(EntityType.PLAYER, "fullwall"); npc.spawn(location);
        
        Checking if an entity is a Citizens NPC
        Citizens NPCs will have the "NPC" Entity metadata set to true. boolean isCitizensNPC = entity.hasMetadata("NPC"); This method doesn't even require a dependency on Citizens, as it works entirely through Spigot!
        
        Making an NPC Move
        Want to make an NPC pathfind to a location? npc.getNavigator().setTarget(yourLocation);
        
        Creating a Trait
        Traits are persistent, attachable objects that are linked to an NPC and provide specific functionality. This can be anything from custom AI to a simple talking trait.
        
        To register a trait, we use the TraitFactory class. This controls registration for your custom traits.
        
        Code:
        //This is your trait that will be applied to a npc using the /trait mytraitname command. Each NPC gets its own instance of this class.
        //the Trait class has a reference to the attached NPC class through the protected field 'npc' or getNPC().
        //The Trait class also implements Listener so you can add EventHandlers directly to your trait.
        @TraitName("mytraitname")
        public class MyTrait extends Trait {
        public MyTrait() {
        super("mytraitname");
        plugin = JavaPlugin.getPlugin(MyPlugin.class);
        }
        
        MyPlugin plugin = null;
        
        boolean SomeSetting = false;
                
                // see the 'Persistence API' section
                @Persist("mysettingname") boolean automaticallyPersistedSetting = false;
        
        // Here you should load up any values you have previously saved (optional). 
                // This does NOT get called when applying the trait for the first time, only loading onto an existing npc at server start.
                // This is called AFTER onAttach so you can load defaults in onAttach and they will be overridden here.
                // This is called BEFORE onSpawn, npc.getEntity() will return null.
        public void load(DataKey key) {
            SomeSetting = key.getBoolean("SomeSetting", false);
        }
        
        // Save settings for this NPC (optional). These values will be persisted to the Citizens saves file
        public void save(DataKey key) {
            key.setBoolean("SomeSetting",SomeSetting);
        }
        
                // An example event handler. All traits will be registered automatically as Spigot event Listeners
        @EventHandler
        public void click(net.citizensnpcs.api.event.NPCRightClickEvent event){
        //Handle a click on a NPC. The event has a getNPC() method. 
        //Be sure to check event.getNPC() == this.getNPC() so you only handle clicks on this NPC!
        
        }
              
                // Called every tick
                @Override
                public void run() {
                }
        
        //Run code when your trait is attached to a NPC. 
                //This is called BEFORE onSpawn, so npc.getEntity() will return null
                //This would be a good place to load configurable defaults for new NPCs.
        @Override
        public void onAttach() {
        plugin.getServer().getLogger().info(npc.getName() + "has been assigned MyTrait!");
        }
        
                // Run code when the NPC is despawned. This is called before the entity actually despawns so npc.getEntity() is still valid.
        @Override
        public void onDespawn() {
                }
        
        //Run code when the NPC is spawned. Note that npc.getEntity() will be null until this method is called.
                //This is called AFTER onAttach and AFTER Load when the server is started.
        @Override
        public void onSpawn() {
        
        }
        
                //run code when the NPC is removed. Use this to tear down any repeating tasks.
        @Override
        public void onRemove() {
                }
        
        }
        
        //This is your Spigot plugin class. Use it to hook your trait into Citizens and handle any commands.
        public class MyPlugin extends org.bukkit.plugin.java.JavaPlugin {
        
                public void onEnable() {
                // check if Citizens is present and enabled.
                if (getServer().getPluginManager().getPlugin("Citizens") == null
                        || !getServer().getPluginManager().getPlugin("Citizens").isEnabled()) {
                    getLogger().log(Level.SEVERE, "Citizens 2.0 not found or not enabled");
                } else {
                    // Register your trait with Citizens.
                    net.citizensnpcs.api.CitizensAPI.getTraitFactory()
                            .registerTrait(net.citizensnpcs.api.trait.TraitInfo.create(MyTrait.class));
                    Bukkit.getServer().getPluginManager().registerEvents(new Listener() {
                        @EventHandler
                        public void onCitizensEnable(CitizensEnableEvent ev) {
                            NPC npc = CitizensAPI.getNPCRegistry().createNPC(EntityType.PLAYER, "Dinnerbone");
                            npc.spawn(yourlocationhere);
                        }
                    }, this);
                }
            }
        }
        
        Dos and Don'ts
        DO
        
        Use Spigot Entity API with npc.getEntity()
        Create a separate event Listener class if you expect there to be many trait instances. This may help performance with frequently called events.
        Honor npc.isProtected() If this is true the NPC should be 'invulnerable' to normal damaging effects.
        Use CitizensAPI.getNPCRegistry().isNPC() to check if an entity is a NPC. Real players and player-type NPCs will both return true for instanceof Player.
        DON'T
        
        Attempt to access npc.getEntity() from within traits until onSpawn() has been called or npc.isSpawned() returns true.
        Change anything in npc.getNavigator().getDefaultParams() unless you're sure you want a global change. Use the localParams() instead after setting a navigation target.
        Assume a NPC is a Player. Mob types have some important differences.
        Default Traits
        Citizens comes by default with Traits for its built-in commands. You can see these Traits in the JavaDocs https://jd.citizensnpcs.co/net/citizensnpcs/api/trait/trait/package-summary.html and also in the Citizens2 GitHub https://github.com/CitizensDev/Citizens2/tree/master/main/src/main/java/net/citizensnpcs/trait.
        
        For example, you might add a piece of armor to an NPC using
        
        npc.getOrAddTrait(Equipment.class).set(EquipmentSlot.BOOTS, new ItemStack(Material.LEATHER_BOOTS, 1));
        NPC Events
        Citizens implements its own Listeners and will call new NPC-specific versions of many common events. This saves Trait developers the trouble of finding their npcs from the normal event entities. The event object these events provide are just like their Spigot counterparts with the addition of the getNPC() method.
        
        See the [Javadocs] for a full list.
        
        Using the AI API
        The AI API of Citizens can be broken down into two parts - GoalController and Navigator.
        
        A Goal is a repeatable, abstract unit of work that can be performed by an NPC. For example, moving to a different location or attacking an enemy until it dies. It can be registered with a GoalController with a priority (higher is more important). The highest priority goal which can be executed will be prioritised. NPC contains getDefaultGoalController() for this purpose.
        
        The GoalSelector allows for the dynamic selection of sub-goals and the concurrent execution of many sub-goals, and can stop execution at any time.
        
        To add a new Goa, plugins should use Behavior interface which is a behavior tree approach. Available node types are listed in the javadocs.
        
        Here is some suggested code for a new leaf Behavior node.
        
        
        
        Code:
         public class MyBehavior extends BehaviorGoalAdapter {
             private Object state; 
             public void reset() {
                 state = null;
                 // this method can be called at any time if another goal is selected
             }
             public BehaviorStatus run() {
                 if(!npcIsCool()) {
                     return BehaviorStatus.FAILURE;
                 } else if (npcIsAwesome()) {
                     return BehaviorStatus.SUCCESS; 
                 } else if (npcNeedsCool()) {
                     new AccumulateCoolBehavior().run(); // easily run other behavior inline
                     return BehaviorStatus.RUNNING;
                 }
             }
             public boolean shouldExecute() {
                 if (npcIsCool()) { 
                     return true;
                 }
                 return false;
             } 
         }
        You can compose behaviors using code like the following example:
        
        Code:
         public void setupTree(NPC npc) {
             npc.getGoalController().addGoal(Sequence.createSequence(new MyBehavior(), new MyAccumulateBehavior(), new MyParallelBehavior()));
        
             // A more complicated example
             npc.getGoalController().addGoal(Sequence.createSequence(
                      new IfElse(() -> npc.isCool(), 
                          TimerDecorator.tickLimiter(new MyLongRunningBehavior(), 100), 
                          new MyElseBehavior()),
                      new MyParallelBehavior()
             ));
         }
        The second important class is Navigator. This enables pathfinding to a destination location or entity over time. The target should be set once only, not every tick. You can listen to the following navigation events to control the pathfinding flow:
        
        NavigationBeginEvent
        NavigationCancelEvent
        NavigationCompleteEvent
        NavigationEvent
        NavigationReplaceEvent
        You can also use the NavigatorParameters class to customise various aspects of pathfinding. The Navigator has two sets of parameters; "default", which are persisted over the lifetime of the NPC, and "local", which is a copy of the default parameters created when a pathfinding target is set.
        
        
        
        Code:
         public void setPathfindingTarget(NPC npc, Location location) {
             npc.getNavigator().getDefaultParameters().speedModifier(1.1); // 110% speed by default.
             npc.getNavigator().setTarget(location);
             npc.getNavigator().getLocalParameters().speedModifier(1.2); // 120% speed for this pathfinding target only
         }
        Using the Persistence API
        Sometimes, traits can store a lot of simple variables such as primitives, Strings, Locations, and others. Saving/loading them via the trait API can be a little bit of overkill.
        
        Citizens provides a simple Persistence API to automatically save and load these variables using DataKeys. The key to this API is the @Persist annotation. Sample code is provided below.
        
        Code: Example
         public class MyTrait extends Trait {
             // logic omitted.
        
            @Persist boolean myVariable = false; // the default value of @Persist saves the value under the field name (in this case, 'myVariable').
            
            @Persist("newkey") int intVariable = 11; // this saves the value under 'newkey'. The default value of the variable has been set to 11 - this will be used when loading if the key doesn't exist.
        
            @Persist(value="newkey", required=true) String required; // if the value under 'newkey' doesn't exist, then the trait will fail to load.
         }
        More advanced use of the API can be found in the @DelegatePersistence annotation. This allows complex types such as Locations to be saved and loaded with finer grained control. These types can be given default delegates by calling PersistenceLoader#registerPersistDelegate(Persister) - Location has a built in Persister for convenience.
        
        
        
        Code:
         public class MyTrait extends Trait {
             // logic omitted.
        
            @Persist 
            @DelegatePersistence(ExplicitComplexTypePersister.class) // explicit delegation
            ComplexType myComplexType;
        
            @Persist ComplexType implicitComplexType; // implicit delegation
            static {
                PersistenceLoader.registerPersistDelegate(ImplicitComplexTypePersister.class);
            }
         }
         
         public class ExplicitComplexTypePersister implements Persister {
             public Object create(DataKey root) {
                 return new ComplexType(root.getInteger("complexstructures"));
             }
             public void save(Object instance, DataKey root) {
                 ComplexType real = (ComplexType) instance; // guaranteed cast - will always succeed.
                 root.setInteger("complexstructures", real.getComplexStructure());
             }
         }
    `


};