# Debugging JSON messages on the wire

## I'd like to see the messaging on the wire, how can I do that?

There is a provided logback config in the src/main/resources folder that will turn on debug logging at the inbound and outbound socket level:

You can use this config by specifying the property into your java options: 

```
-Dlogback.configurationFile=logback-socket.xml
```

You can also see the full details about how Netty is configuring your socket connectivity by supplying: 

```
-Dlogback.configurationFile=logback-netty.xml
```



# FAQs

- [001 - How do I debug JSON Messages on the Wire](debugging_json_messages)
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Using binaries from Maven Repo

<SvgDottySeparator style={{marginBottom: 32}}/>

The Vuu binaries are hosted in Maven Central under the namespace: [org.finos.vuu](https://repo1.maven.org/maven2/org/finos/vuu/).

You can add them to your pom by referencing the parent pom directly.

```
    <dependency>
        <groupId>org.finos</groupId>
        <artifactId>vuu-parent</artifactId>
        <version>{check the latest version}</version>
    </dependency>

        <dependency>
        <groupId>org.finos</groupId>
        <artifactId>vuu-ui</artifactId>
        <version>{check the latest version}</version>
    </dependency>
```

Adding the javascript components:

```
Work in Progress....
```
# Building From Source



import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Configuration

<SvgDottySeparator style={{marginBottom: 32}}/>

```
Work in Progress....
```
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Developing Vuu

<SvgDottySeparator/>

## Prerequisites

1. Install IntelliJ Community Edition (latest version with supported scala plugin).
2. Install SDKMan from the [website](https://sdkman.io/) or using your own mechanism
3. type>`sdk install java 11.0.12-open` and then >`sdk d java 11.0.12-open` to make sure you're using the correct one.
4. Clone the repo into a directory on your machine
5. Open the project as a Maven build by selecting the root pom.xml (make sure you select "enable adding maven modules, auto import etc..)
6. You should get one root module vuu-parent in a project list, select this
7. When the project opens you should have 3 sub-modules (vuu, toolbox and vuu-ui)

<SvgDottySeparator style={{marginTop: 32}}/>

## Developing the client

If you are comfortable running the server in an IDE, you can follow the instructions above. If not
you can use the specific maven targets from the command line to run up the sample app.

You can install command line maven via any means you please, but sdkman makes it easy...

```bash
sdk install maven
```

## Installation - Server

### Prerequisites

See the [Docs](https://vuu.finos.org/docs/getting_started/developing) for Java versions and install dependencies you need to have.

OS X & Linux:

```sh
#In your favourite code directory...
git clone https://github.com/finos/vuu.git
#cd into the repository
cd vuu
#run the maven compile step
mvn compile
#cd into vuu, child in repo
cd example/main
#The server should now be started on your machine with Simulation module
mvn exec:exec
```

Windows:

```sh
this should be the same as Linux & MacOS just with Windows adjusted paths
```

## Running the Vuu Server Simulation Module from IDE

1. Go to the SimulMain.scala, right click and run (add these into JVM args -Xmx10G -Xms5G, or whatever you have available)

## Installation - Client

You will need npm at version 16 or greater to build the client.

```sh
#in vuu repo (not vuu child directory in repo)
cd vuu-ui
npm install
npm run build
npm run build:app
#if you would also like to use electron rather than Chrome/Chromium
cd tools/electron
npm install #You only need to do this once initially and when the electron version is upgraded
cd ../..
npm run launch:demo:electron
```

If you are using Chrome, you should now be able to use a local browser to see the Vuu demo app. [localhost:8443](https://localhost:8443/index.html)

If you are getting certificate errors when you connect, set this browser setting in chrome:

```
chrome://flags/#allow-insecure-localhost (set to true)
```

## Developing the Vuu Book

We use [docusaurus](https://docusaurus.io/blog/2022/08/01/announcing-docusaurus-2.0) to generate the Vuu docs from markdown.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Using Vuu from Java

<SvgDottySeparator style={{marginBottom: 32}}/>

We have a sample Maven project on the Vuu Github site:

[Getting Started in Java](https://github.com/venuu-io/vuu-getting-started)
# Github Repository

* [Main Repository](https://github.com/venuu-io/vuu)
* [Sample Project Repository](https://github.com/venuu-io/vuu-getting-started)

# How does it work

Let's start with a diagram.

![](./diagrams-server-internals.png)

This shows the basic flow through the system, there are components which have been omitted for clarity.

On the left hand side of the screen you can see **providers**. These source data from the external world, or a model in process
and push them into a table. The table acts like a sink and forwards the event onto any join tables that are composed of
this underlying table, and or to any viewports that are on this table directly.

**Viewports** are a users view onto a particular table, or join table. Viewports have knowledge of where a user is looking
onto the underlying data. They also know if the user has asked for a filter or sort on the data.

Finally we have the UI. This is connected to the Vuu server via a websocket and receives updates in realtime.

There are two important factors to take into account from this diagram, the first is that what is in your viewport is calculated
out of band on a separate thread to the update path (Filter and Sort Thread.) The filter and sort thread takes the underlying
table you have asked for in your viewport and applies the filters and sorts you've requested. The resulting array of
primary keys is then pushed into your viewport.

THe update path, by comparison, is different. If you have a particular key in the visible range of your viewport already
and it is updated, it follows the tick() path, so it will progress through the system as an event, on the same thread
as the provider itself.

The upshot of this is that **Vuu favours the update path** (the orange line in the diagram) over the calculation of new data in your UI. You will most
likely rarely if ever notice this, but it is an important concept.
# What are the trade offs

Here are some trade-offs for view servers in general and Vuu itself 

1. View servers are complicated pieces of software and adding them into your stack adds complexity. 
2. VS's move more processing from the client to the server, so if you're worried about server capacity, it may not be for you. 
3. Vuu itself favours the tick path, this means that when you have aggregates (see trees later) you can end up with 
eventually consistent aggregates vs column values. For example if my tree has a Sum(orders.price) and the price is changing
every second, your total will only be calculated on a cycle, not on every tick. THis is mostly fine, but can cause issues
with some systems. 
# What is a View (Vuu) Server

A View Server is a component in a computer system which allows you to track state and potentially off-load some 
of the processing cost of the UI on to the server. 

Typically many users can connect into a single view server, and data which is being used by them can be shared rather than distinct copies. 

View Servers offer some or all of these features to a UI:

* **View Porting** - The Server maintains a full set of data for the client. When a client has a large grid open on their 
screen they are passed only the data that is visible (plus a bit extra at the top and bottom for performance), not the entire data set. When the 
client then scrolls through this data it appears it's all on the client but is in reality being streamed from the server.
Updates to the client's data (view port) are propagated as they happen. Server side viewports can offer:
  * **Filtering & Sorting** of the data, as if it were on the client. 
  * **Treeing and Aggregations** on columns within viewports
* **Remote Procedure Calls** - When a client wants to effect change in the outside world they need a place to host business
logic. This business logic potentially needs access to the whole set of data within the server itself. As the client only has its viewport
onto this data, it is poorly suited to do that. RPC calls are a way of hosting logic that a client can call.
* **Joining Data** - When data comes from different sources, example stock prices verses stock reference data, we often want to join that data together
and present it as a single table/single grid at runtime. 
* **Storing of UI State** - When a client changes how her UI is configured, the view server typically offers a mechanism to persist that state. 

Happily Vuu offers all of these features. 

## What Vuu Is:

* A mechanism for representing ticking external data in table form on the server
* A relational algebra function for joining tables on server at runtime, including linking parent child tables
* A viewporting layer for giving clients a virtualized view onto large tables
* A filter (ANTLR grammar) and sort within viewports
* A "fast path" for updating ticking data to the client
* A "slow path" for updating viewport contents via separate threads
* A treeing and aggregation mechanism (showing totals, averages etc..)
* A highly performant React based Grid implementation and layout framework
* A websocket based wire protocol for handling viewport changes
* An RPC framework for invoking CRUD style operations on the server from the client 

## What Vuu is not:

* A UI Widget framework
* A client side UI Framework
* An alternative to Tomcat/Websphere
* A portal framework
* A data distribution or store and forward technology like Kafka or MQ

## When should I use Vuu?

* If you want to develop a highly functional largely grid based app
* Where your data neatly fits into a table like paradigm
* Where you want to target html5 technologies
* Where you want updates to trigger directly through to client when they occur in the outside world 
# Indices

Indices are a mechansim for filter a tables keys quickly. They are defined as part of a table  and under the hood they are implemented as skip lists. 
Currently, there is no query planner for indices, as a more advanced SQL database might have. They simply will shortcut the filtering process if an index exists on a field. 

Adding indices to a field dramatically reduces the cost of filter on that field, at the memory expense of maintaining an extra data structure and slight processing overhead.  

Below is a table that has an index defined on the ric field. 

```scala

    TableDef(
          name = "parentOrders",
          keyField = "id",
          Columns.fromNames("id:String", "idAsInt: Int", "ric:String", "childCount: Int", "price:Double", "quantity:Int", "side:String", "account:String", "exchange: String",
                                    "ccy: String", "algo: String", "volLimit:Double", "filledQty:Int", "openQty:Int", "averagePrice: Double", "status:String",
                                    "lastUpdate:Long"),
          VisualLinks(
            Link("ric", "prices", "ric")
          ),
          //index
          indices = Indices(
            Index("ric")
          ),
          joinFields = "id", "ric"
        ),
        (table, vs) => new ParentOrdersProvider(table, ordersModel)
      )


```# Performance Optimization

```
Work in Progress....
```# Query Planner

```
Work in Progress....
```

- [issue-199](https://github.com/venuu-io/vuu/issues/199) - Tracked here. 

import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Filters and Sorts

<SvgDottySeparator style={{marginBottom: 32}}/>

Vuu supports either single or multifield sorting by ASC or DESC.

Vuu also has an [ANTLR grammar](https://github.com/finos/vuu/tree/main/vuu/src/main/antlr4/org/finos/vuu/grammar) which allows filtering within viewports.
Some examples of what is supported in this grammar are:

```

ccy in [USD,GBP]

ric starts A

quantity > 1000 or quantity < 10

ric = TWTR and quantity > 10000
```

See more examples in the [Tests](https://github.com/finos/vuu/blob/main/vuu/src/test/scala/org/finos/vuu/core/filter/FilterGrammarTest.scala)
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Lifecycle

<SvgDottySeparator style={{marginBottom: 32}}/>

Vuu has a simple server side lifecycle component built it. The lifecycle is implemented as a DAG (Directed Acyclic Graph)
which allows components to be started and stopped in a sensible order.

## How does the lifecycle work?

The user interaction with the lifecycle component is very minimal by design. THe obligation is when there is a component
that depends on something else, it registers that dependency in the construction logic.

As an example if we take the VuiStateStoreProvider

```scala
class VuiStateStoreProvider(val table: DataTable, val store: VuiStateStore)(implicit clock: Clock, lifecycleContainer: LifecycleContainer) extends Provider {

  //we create a lifecycle enabled runner, which is basically a thread
  private final val runner = new LifeCycleRunner("vuiStateStoreProviderRunner", () => runOnce(), minCycleTime = 10)
  //then we tell the lifecycle that this node depends on the runner being created before we can be fully initialized.
  lifecycleContainer(this).dependsOn(runner)

  override val lifecycleId: String = "vuiStateStoreProvider"
  // <snip/>

  def runOnce() = {
    // <snip/>
  }

  override def subscribe(key: String): Unit = {}
  override def doStart(): Unit = {}
  override def doStop(): Unit = {}
  override def doInitialize(): Unit = {}
  override def doDestroy(): Unit = {}
}

```

By calling:

```scala
lifecycleContainer(this).dependsOn(runner)
```

What this means is that in the graph behind we have now created a vertex (directional dependency) between the runner and the VuiStateStoreProvider.

```
(Core Components)
    --> VuiStateStoreProvider
                --> LifeCycleRunner("vuiStateStoreProviderRunner")
```

When Vuuu starts up it evaluates components from the furthest node out back to the root node. So the lifecycle runners will be started before the VuiStateStoreProvider before the core componenets etc..

## What does the Vui lifecycle look like on startup?

![Lifecycle Vuu](./vuu.svg)

As you can see from this graph. The server has as well defined startup and shutdown sequencer, controlled by its lifecycle.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Modules

<SvgDottySeparator style={{marginBottom: 32}}/>

Modules are how we describe tables, providers and RPC calls that we want to add to Vuu. Each module is a logical unit of functionality that can be shared.

## How to define a module

The best place to start with defining a module is to look at the existing ones provided in the core infra.

## An example module definition:

```scala
object VuiStateModule extends DefaultModule {

  final val NAME = "vui"

  def apply(store: VuiStateStore)(implicit clock: Clock, lifecycle: LifecycleContainer): ViewServerModule = {

    ModuleFactory.withNamespace(NAME)
      .addTable(
        TableDef(
          name = "uiState",
          keyField = "uniqueId",
          columns = Columns.fromNames("uniqueId".string(), "user".string(), "id".string(), "lastUpdate".long()),
          VisualLinks(),
        ),
        (table, vs) => new VuiStateStoreProvider(table, store)
      )
      .addRestService(_ => new VuiStateRestService(store))
      .asModule()
  }
}
```

Above is the module which provides storage and retrieval of UI state across sessions. As you can see there are a few key things that you need to provide when adding a module.

1. Name - This is a unique name in the deployment
2. An apply function that defines zero or more tables, providers, rest services, rpc services etc..

The `addTable()` builder method defines a new table, named `uiState`, with the primary key `uniqueId`. Besides the primary key, the table has three data fields - `user`, `id` and `lastUpdate`.

The last argument of `addTable()` is a factory function, creating a [`provider`](providers.md) instance, that will be responsible from sourcing data from somewhere and updating our table by inserting/updating/removing rows.

The `VuiStateStoreProvider` implementation uses a utility class `VuiStateStore` to retrieve the versions of the UI that have been saved. It also stores a magic head state which is the current live state.

```scala
class VuiStateStoreProvider(val table: DataTable, val store: VuiStateStore)(implicit clock: Clock, lifecycleContainer: LifecycleContainer) extends Provider {

  private final val runner = new LifeCycleRunner("vuiStateStoreProviderRunner", () => runOnce(), minCycleTime = 10)
  override val lifecycleId: String = "vuiStateStoreProvider"
  @volatile
  private var lastState = List[VuiHeader]()

  def runOnce() = {

    val states = store.getAll()

    for(state <- states){
      val dataMap = Map(
        "uniqueId" -> state.uniqueId,
        "user" -> state.user,
        "id" -> state.id,
        "lastUpdate" -> state.lastUpdate
      )
      table.processUpdate(state.uniqueId, RowWithData(state.uniqueId, dataMap), clock.now())
    }

    for(oldState <- lastState){
      if(!states.contains(oldState)){
        table.processDelete(oldState.uniqueId)
      }
    }

    lastState = states
  }

  override def subscribe(key: String): Unit = {}
  override def doStart(): Unit = {}
  override def doStop(): Unit = {}
  override def doInitialize(): Unit = {}
  override def doDestroy(): Unit = {}
}
```

In the module we also define a rest service. This is how the UI interacts with the state store. THe rest service is exposed via the underlying Vert.x
infrastructure.

```scala
class VuiStateRestService(val store: VuiStateStore)(implicit clock: Clock) extends RestService {

  private final val service = "vui"

  override def getServiceName: String = service
  override def getUriGetAll: String = s"/api/$service/:user"
  override def getUriGet: String = s"/api/$service/:user/:id"
  override def getUriPost: String = s"/api/$service/:user"
  override def getUriDelete: String = s"/api/$service/:user/:id"
  override def getUriPut: String = s"/api/$service/:user/:id"

  override def onGetAll(ctx: RoutingContext): Unit = {
    val user = ctx.request().getParam("user")
    if(user == null){
      reply404(ctx)
    }else{
      val states = store.getAllFor(user)
      val json = JsonUtil.toPrettyJson(states)
      ctx.response()
        .putHeader("content-type", "application/json; charset=utf-8")
        .end(json)
    }
  }

  override def onPost(ctx: RoutingContext): Unit = {
    val user = ctx.request().getParam("user")
    val id   = "latest"
    val json = ctx.getBodyAsString()

    if(user == null || id == null || json == null){
      reply404(ctx)
    }else{
      store.add(VuiState(VuiHeader(user, id, user + "." + id, clock.now()), VuiJsonState(json)))
      ctx.response()
        .setStatusCode(201)
        .putHeader("content-type", "application/json; charset=utf-8")
        .end(json);
    }
  }

  override def onGet(ctx: RoutingContext): Unit = {
    val user = ctx.request().getParam("user")
    val id   = ctx.request().getParam("id")
    if(user == null || id == null){
      ctx.response().setStatusCode(404).end()
    }else{
      store.get(user, id) match {
        case Some(state) =>
          ctx.response()
            .putHeader("content-type", "application/json; charset=utf-8")
            .end(state.json.json);
        case None =>
          reply404(ctx)
      }
    }
  }

  override def onPut(ctx: RoutingContext): Unit = {
    val user = ctx.request().getParam("user")
    val id   = ctx.request().getParam("id")
    val json = ctx.getBodyAsString()
    if(user == null || id == null || json == null){
      reply404(ctx)
    }else{
      store.add(VuiState(VuiHeader(user, id, user + "." + id, clock.now()), VuiJsonState(json)))
      ctx.response()
        .setStatusCode(201)
        .putHeader("content-type", "application/json; charset=utf-8")
        .end(json);
    }
  }

  override def onDelete(ctx: RoutingContext): Unit = {
    val user = ctx.request().getParam("user")
    val id   = ctx.request().getParam("id")
    if(user == null || id == null){
      reply404(ctx)
    }else{
      store.delete(user, id)
      ctx.response.setStatusCode(204).end()
    }
  }
}


```

So you can see from this example we have:

1. A storage mechanism, the VuiStateStore
2. An update and retrieve mechanism, via the REST service.
3. A table definition, that exposes the state store to the UI via the table mechanism. In this case this is largely for auditing purposes.

From here we can move onto to a ore complicated example.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Providers

<SvgDottySeparator style={{marginBottom: 32}}/>

Providers are classes which receive data from a particlar location (network, file, in-process lib) and format that data into a map which matches the shape of the table
that the provider is populating. THey have a very simple interface:

Included below is an example of the metrics provider.

```scala

class MetricsTableProvider (table: DataTable, tableContainer: TableContainer)(implicit clock: Clock, lifecycleContainer: LifecycleContainer,
                                                                              metrics: MetricsProvider ) extends Provider with StrictLogging {

  private val runner = new LifeCycleRunner("metricsTableProvider", () => runOnce, minCycleTime = 1_000)

  lifecycleContainer(this).dependsOn(runner)

  override def subscribe(key: String): Unit = {}

  override def doStart(): Unit = {}

  override def doStop(): Unit = {}

  override def doInitialize(): Unit = {}

  override def doDestroy(): Unit = {}

  override val lifecycleId: String = "metricsTableProvider"

  def runOnce(): Unit ={

    try {

      val tables = tableContainer.getTables()

      tables.foreach(tableDef => {

        val counter = metrics.counter(tableDef.table + ".processUpdates.Counter");
        val size = tableContainer.getTable(tableDef.table).size()

        val meter = metrics.meter(tableDef.table + ".processUpdates.Meter")

        val upMap = Map("table" -> (tableDef.module + "-" + tableDef.table), "updateCount" -> counter.getCount, "size" -> size, "updatesPerSecond" -> meter.getOneMinuteRate);

        table.processUpdate(tableDef.table, RowWithData(tableDef.table, upMap), clock.now())

      })

    } catch {
      case e: Exception =>
        logger.error("Error occured in metrics", e)
    }
  }
}
```

As you can see from the code the important lines are:

```scala
  private val runner = new LifeCycleRunner("metricsTableProvider", () => runOnce, minCycleTime = 1_000)

  lifecycleContainer(this).dependsOn(runner)

```

This sets up a thread (in this case a lifecycle aware thread, so that it shuts down happily when the process is killed)

And the runOnce() method:

```scala
  def runOnce(): Unit ={

    try {

      val tables = tableContainer.getTables()

      tables.foreach(tableDef => {

        //source the metric's information from the metrics api for a specific table
        val counter = metrics.counter(tableDef.table + ".processUpdates.Counter");
        val size = tableContainer.getTable(tableDef.table).size()
        val meter = metrics.meter(tableDef.table + ".processUpdates.Meter")

        //format the data into a map
        val dataMap = Map("table" -> (tableDef.module + "-" + tableDef.table), "updateCount" -> counter.getCount, "size" -> size, "updatesPerSecond" -> meter.getOneMinuteRate);

        //pass the data into the table as a RowWithData object, the map embedded within
        table.processUpdate(tableDef.table, RowWithData(tableDef.table, dataMap), clock.now())

      })

    } catch {
      case e: Exception =>
        logger.error("Error occured in metrics", e)
    }
  }
```

As the code comments show the runOnce() method populates the table with data.
import { MdxSection } from "@site/src/components/MdxSection";
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Core Concepts

<SvgDottySeparator style={{marginBottom: 32}}/>

<MdxSection
  title="Lifecycle"
  titleLink="./lifecycle"
  subTitle="Manages the startup sequence of the server."
  className="vuu-section-2-col-1 lifecycle"
/>
<MdxSection
  title="Providers"
  titleLink="./providers"
  subTitle="Populate Vuu tables from external sources, such as the network."
  className="vuu-section-2-col-2 providers"
/>
<MdxSection
  title="Tables"
  titleLink="./tables"
  subTitle="Store data in memory, subsets of which are displayed via viewports."
  className="vuu-section-2-col-1 tables"
/>
<MdxSection
  title="Viewports"
  titleLink="./viewports"
  subTitle="Are user subscriptions to tables, capturing sort, filter criteria etc."
  className="vuu-section-2-col-2 viewports"
/>
<MdxSection
  title="Filters, Sorts, Trees"
  titleLink="./filter_sort"
  subTitle="Configured per Viewport e.g. per DataTable UI component"
  className="vuu-section-2-col-1 filters-sorts-trees"
/>
<MdxSection
  title="Modules"
  titleLink="./modules"
  subTitle="Reusable configuration units. Define tables, providers, RPC calls etc"
  className="vuu-section-2-col-2 modules"
/>
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Tables

<SvgDottySeparator style={{marginBottom: 32}}/>

Tables are sinks of data. At the lowest form they are wrappers around concurrent maps that offer some value add in propogating updates and deletes for through the system.

Data tables are represented by the interface org.finos.vuu.core.table.DataTable in the source code.

```scala
trait DataTable extends KeyedObservable[RowKeyUpdate] with RowSource {

  def getTableDef: TableDef

  //<snip/>

  def processUpdate(rowKey: String, rowUpdate: RowWithData, timeStamp: Long): Unit

  def processDelete(rowKey: String): Unit

  def size(): Long = {
    primaryKeys.length
  }

  //<snip/>
}

```

The important methods from this trait for these purposes are:

```scala
def processUpdate(...)
def processDelete(...)
```

These are the methods that you call in a provider to populate data into the underlying map. If you go back to the [Providers](providers.md) example you can see it is indeed the update method being called.

processUpdate functions like an upsert in a SQL data (i.e. it is used for both an insert and an update)

# Types of Table

# (Simple) Table

Simple Tables (the default table type, defined by using the TableDef() class) are sinks for data. They are wrappers around
a concurrent map and are mechanisms to propogate update or delete events to join tables and view ports.

Currently simple tables are limited to having strings as the key. This is likely to change in future.

# Join Tables

Join tables represent the logical joining of two separate tables into a single merged table. In practice they are mappings of
keys from one table to keys from one or more other tables. When data is realised (i.e. sent down to a user's ui via the websocket)
the relevant rows are realized by dragging the data from the underlying simple tables.

# AutoSubscribe Table

Auto subscriber tables are simple data tables that when involved in a join will receive a special callback as part of the join process
to load data from a n external source by primary key.

An example of an auto subscribe table would be where we have an external source, such as market data, that we only want to subscribe to if we have any other data
like orders on particular symbols. When we join orders and prices, if the prices tables is defined as an auto subscribe table, we will make a call to the
autosubscribe table with the product symbol on the order once each time a new order is entered.

# Session Tables

Session tables are specific types of tables that live only during the users connected session to Vuu. There are several different types of session table:

### Tree Session Tables

Tree Session tables are created dyanmically whenever there is a request to tree an underlying flat table. THe reason for this is that Tree's are a view ontop of
and underlying raw table. When we create a tree, we are generating a tree data structure in memory whose leaves are keys that point back to the original rows
in the underlying table. When your session is closed, the server cleans up these tree tables, freeing up resources.

From a usage perspective you would typically not see these session tables, however its important o know they exist.

### Input Session Tables

Input Session tables are sinks for data where the data lives only within your session. They are defined in the same way as normal tables
however they are treated differently in that when a viewport is created for the session table, a new instance is created and registered with the
tableContainer.

```scala
//insert sample declaration, here
```

### Join Session Tables

Join Session tables are similar in concept to normal join tables, the only caveat is that like all session tables they only exist
for the lifetime of the session.

Join Session tables are useful when you want to have an input table, such as orders, but you want to show join table in the UI
beside the orders, such as ticking prices, or static data.

With a declaration like below, you can achieve that:

```scala
//insert example
```

# Lucene Table

TODO: Lucene tables are a work in progress, watch this space.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Viewports

<SvgDottySeparator style={{marginBottom: 32}}/>

A Viewport is a specific client's view onto an underlying table. It has knowledge of the underlying table that a viewport is looking at. It also has knowledge of
the window of data that a client currently has displayed on her screen. It contains information on any sorts, or filters that a specific client
has requested on the data, on columns that the client has asked to display as well as information such as which rows are currently selected on the clients grid.

As well as this viewports contain references to immutable arrays of the keys of the underlying table. These arrays are sorted and filtered based on the clients
requested sort of the data.

When a user opens a viewport on a table from the client, a thread in the server will asynchronously populate the keys based on the viewports parameters (sorts, filters, etc..) into an immutable array
and will pass that array to the viewport. This thread will then continuously recalculate the keys (if there have been any changes) during the lifetime of the viewport.

The row that is sent to a user is only realized in the viewport at the point the row becomes visible in the client (or part of the pre-post fetch.) This occurs by dragging the fields from the underlying tables
when an update needs to be sent to the client.

![Viewport](./diagrams-view-ports.png)

And in the context of the wider Vuu server.

![Viewport](./diagrams-server-internals.png)
# Conditional Formatting

Tracked by issue [#223](https://github.com/venuu-io/vuu/issues/223)

### Introduction

Conditional formatting can be though of as two concepts, 1) a filter criteria: 
```
ric = VOD.L or notional > 1000
```
And a set of styling to be applied should that filter evaluate to true. 

For performance sake, the conditional formatting should be evaluated on the server side, at the time of realising a row
and sent down the websocket as additional data with the row. 

### What kind of styling can be applied?

Conditional formatting should allow the user to specify: 

1. Font, size, bold, strikethrough, italic
2. Fore (text) colour
3. Back colour
4. Border colour
5. Decay Flash (i.e. how we handle bid/offer updates)
6. Numeric formatting (decimal places, comma's etc..)

### How should we define styling on a viewport?

One way to implement the styling would be to generate a css class on the client (say "af9c") and then to define criteria where that style should be applied (ex. ric = FOO) and then
when that criteria evaluates to true, we would put the style back in the row update message to the client. 



**Questions:**

1. How would we transit the formatting information?

```json
{"type":"TABLE_ROW","batch":"36922aea-ad02-4eae-9a09-10f0a4bb1297","isLast":true,"timeStamp":1639654847947,"rows":[
{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":-1,"rowKey":"SIZE","updateType":"SIZE","ts":1639654847946,"sel":0,"data":[]},
{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":0,"rowKey":"AAA.L","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA LN","USD","AAA.L London PLC","XLON/LSE-SETS","",633,"AAA.L"]},
{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":1,"rowKey":"AAA.N","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA US","EUR","AAA.N Corporation","XNGS/NAS-GSM","",220,"AAA.N"]}
```

Probably the easiest implementation would be to add an optional rowFormat="" tag for row level formatting and an array of columnFormats=[] which would mirror the 
data tag. 

2. how would we represent the data for the formatting?

We could either use a style sheet style "font-family":, font-size: 10, colour: red
2
Or we could compress it, potentially giving each font a integer code "123:10:255:255:1", this would likely be faster to parse, but may limit how flexible we can be:
(example how would we add a new font to the integer lookup?) perhaps that might be a fair sacrifice for speed. 

3. Should this styling be available by default?
Probably yes, we may want to format cells a certain way in the UI, also that could differ based on the user's locale.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# RPC Calls

<SvgDottySeparator style={{marginBottom: 32}}/>

## Menu Items

Menu items encapsulate behaviour that we expose in a UI component at runtime in a generic way. UI components can be authored (the Vuu DataTable is an example) such that they offer these commands to the user with no client-side configuration required nor any knowledge of the Menu items themselves or their structure. That is all determnined server-side. Context Menus are used to present Menu items to users. Alternative UI implementations are possible, but would require some custom UI work, Context Menus are assumed in the explanations that follow.

The Menu items available for a given ViewPort can be queried with a `GET_VIEW_PORT_MENUS` message and are returned in a `VIEW_PORT_MENUS_RESP` response. The UI client issues this request for every ViewPort created (on receipt of the `CREATE_VP_SUCCESS` message).

Menu items have a concept of `context` which helps determine whether of not a particular Menu item should be included in a Menu when a user opens a Context Menu from a given location within the UI. The `context` also determines how the UI handles the Menu item when clicked by the user. When a Menu item is clicked, the UI will send a message to the server. The type and payload of this message is determined by the context.
It is the responsibility of the UI to build the Context Menu (or other UI componentry to expose Menu items) with an appropriate treatment of `context` that takes into account the UI location clicked by user. The Vuu client packages provide such an implementation, using the Vuu ContextMenu component. The Vuu Table component has this behaviour built-in.

Currently, four context values are supported, each Menu item must use one of these context values:

- `table`: Menu item will send a `VIEW_PORT_MENU_TABLE_RPC` message to server, no payload
- `row`: Menu item will send a `VIEW_PORT_MENU_ROW_RPC` message to server, payload includes row clicked
- `cell`: Menu item will send a `VIEW_PORT_MENU_CELL_RPC` message to server, payload includes row and column clicked
- `selected-rows`: Menu item will send a `VIEW_PORT_MENU_SELECT_RPC` message to server. No payload, server knows which rows are selected

Menu items are defined on the server, alongside the table definition in the module, per the following example:

```scala
      .addTable(
        AutoSubscribeTableDef(
          name = "prices",
          keyField = "ric",
          Columns.fromNames("ric".string(), "bid".double(), "bidSize".int(), "ask".double(), "askSize".int(),
                            "last".double(), "open".double(), "close".double(), "scenario".string(), "phase".string()),
          joinFields = "ric"
        ),
        (table, vs) => new SimulatedPricesProvider(table, maxSleep = 800),
        //this callback explicitly adds behaviour to the menu items
        (table, provider, providerContainer) => ViewPortDef(
          columns = table.getTableDef.columns,
          service = new PricesService(table, provider)
        )
      )
```

You can see in the definition of the prices table below the provider, there is an additional section ViewPortDef()
This allows us to specify a service we want to be associated with the viewport. This service is behaviour we're adding
to the default viewport/grid.

Looking at the definition of the service you can see:

```scala
class PricesService(val table: DataTable, val provider: Provider) extends RpcHandler with StrictLogging {

  private val pricesProvider = provider.asInstanceOf[SimulatedPricesProvider]

  def setSpeedSlow(selection: ViewPortSelection, sessionId: ClientSessionId):ViewPortAction = {
    pricesProvider.setSpeed(8000)
    NoAction()
  }

  def setSpeedMedium(selection: ViewPortSelection, sessionId: ClientSessionId):ViewPortAction = {
    pricesProvider.setSpeed(2000)
    NoAction()
  }

  def setSpeedFast(selection: ViewPortSelection, sessionId: ClientSessionId):ViewPortAction = {
    pricesProvider.setSpeed(400)
    NoAction()
  }

  override def menuItems(): ViewPortMenu = ViewPortMenu("Root",
      new SelectionViewPortMenuItem("Set Slow", "", this.setSpeedSlow, "SET_SPEED_SLOW"),
      new SelectionViewPortMenuItem("Set Medium", "", this.setSpeedMedium, "SET_SPEED_MED"),
      new SelectionViewPortMenuItem("Set Fast", "", this.setSpeedFast, "SET_SPEED_FAST")
  )
}
```

That there is a callback to define Menu Items, which returns three options, set Slow, Set Medium, Set Fast.
The other interesting point is that the MenuItems are typed to SelectionViewPortMenuItem's.

Looking at the method signature you can see that all the calls are off the form:

```scala
def setSpeedSlow(selection: ViewPortSelection, sessionId: ClientSessionId):ViewPortAction
```

Where the ViewPortSelection is passed in.

What this means in practice is that these options are only displayed when a row is selected, and when a menu item is clicked
the server is passed the details of which row(s) are selected.

In this case, we don't do anything with the data, however you could image that this might be a delete record type interaction
where knowing the row that we want to delete is key.

The other options we have for typing the calls are:

```scala
@JsonIgnoreProperties(Array("func", "menus"))
class SelectionViewPortMenuItem(override val name: String, filter: String, val func: (ViewPortSelection, ClientSessionId) => ViewPortAction, rpcName: String) extends ViewPortMenuItem(name, filter, rpcName) {
  val context: String = "selected-rows"
}

@JsonIgnoreProperties(Array("func", "menus"))
class CellViewPortMenuItem(override val name: String, filter: String, val func: (String, String, Object, ClientSessionId) => ViewPortAction, rpcName: String) extends ViewPortMenuItem(name, filter, rpcName) {
  val context: String = "cell"
}

@JsonIgnoreProperties(Array("func", "menus"))
class TableViewPortMenuItem(override val name: String, filter: String, val func: (ClientSessionId) => ViewPortAction, rpcName: String) extends ViewPortMenuItem(name, filter, rpcName) {
  val context: String = "grid"
}

@JsonIgnoreProperties(Array("func", "menus"))
class RowViewPortMenuItem(override val name: String, filter: String, val func: (String, Map[String, AnyRef], ClientSessionId) => ViewPortAction, rpcName: String) extends ViewPortMenuItem(name, filter, rpcName) {
  val context: String = "row"
}
```

You can see from the method signatures they each have a specific purpose:

| Aggregate Type            | Description                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| SelectionViewPortMenuItem | Passes the selected rows back to rpc service                                                            |
| CellViewPortMenuItem      | Passes the value in an individual cell                                                                  |
| TableViewPortMenuItem     | Passes no context other than the fact we're in this table                                               |
| RowViewPortMenuItem       | Passes the content of a row, not this need not be the selected row and may not exist in the grid at all |

## User interaction with Menu Items

Each Menu item has a unique `rpcName`. When the user clicks a Menu item in the UI, a `VIEW_PORT_MENU_<context>_RPC` message should be sent to the server, together with this rpcName and the appropriate payload. The server will respond with a `VIEW_PORT_MENU_RESP` message and an `action`. Many Menu items will trigger behaviour on the server which require no further input from the user. In these cases, the `action` returned with the menu response will be `NO_ACTION`.

Menu items may require further input from the user. This can be entirely managed from the server, using a [Session Table](../providers_tables_viewports//tables.md). There is an example of this interaction in the default installation of Vuu in the `EDITABLE` module. This can be tested in the UI by adding the EDITABLE.Process table to a workspace, selecting a row and invoking the `Admin/Reset SeqNum` menu action.

this works as follows:

When user clicks this Menu item, server is sent a `VIEW_PORT_MENUS_SELECT_RPC` message with the rpcName `OPEN_EDIT_RESET_FIX`. The server will create a Session table to manage the data that the user will be invited to edit. In the case of this example they will just edit the sequence number. Having created the Session Table, the server will respond with a `VIEW_PORT_MENU_RESP` message which will include an action that looks something like the following:

```json
{
  "type": "OPEN_DIALOG_ACTION",
  "table": {
    "table": "session:ClientSessionId(SESS-4f10bbdb-d634-4360-9252-47418ee503a7,user)/simple-fixSequenceReset_1684329685192",
    "module": "EDITABLE"
  },
  "renderComponent": "inline-form"
}
```

This is an instruction to the UI to show an input form to the user to capture data. Whatever UI is displayed should be bound to the Session table provided. In other words, an editable view should be opened on this table and any edits performed by the user shoule be communicated to the server.
The `renderComponent` attribute provides a hint to the UI to help it decide what kind of UI component to use for this. The default would be an editable DataTable. Here, we indicate that some kind of Form should be used. This could also be used to specify a more custom UI component, eg a Trading Ticket or custom Form.

The following RPC messages can be employed by the UI to communicate data edits to the server

- VP_EDIT_CELL_RPC
- VP_EDIT_ROW_RPC
- VP_EDIT_ADD_ROW_RPC
- VP_EDIT_DELETE_CELL_RPC
- VP_EDIT_DELETE_ROW_RPC

When the user has finished editing data, they will submit the work, a `VP_EDIT_SUBMIT_FORM_RPC` message communicates this to the server. The server will then perform whatever business functionality is appropriate, using the edited data and terminate the workflow with one of either `VP_EDIT_RPC_SUCCESS` ??? or `VP_EDIT_RPC_REJECT`, according to the outcome. Although the example used manages edits to just one column/attribute, this approach can scale to editing much larger data structures.

The server code that manages the Session table will look something like the following example (from the EDITABLE module)

from the EDITABLE module definition, we include the definition of the Session Table needed for editing ...

```scala
      .addTable(
        TableDef(
          name = "process",
          keyField = "id",
          columns = Columns.fromNames("id".string(), "name".string(), "uptime".long(), "status".string()),
          VisualLinks(),
          joinFields = "id"
        ),
        (table, vs) => new ProcessProvider(table),
        (table, _, _, tableContainer) => ViewPortDef(
          columns = table.getTableDef.columns,
          service = new ProcessRpcService(tableContainer)
        )
      ).addSessionTable(
      SessionTableDef(
        name = "fixSequenceReset",
        keyField = "process-id",
        columns = Columns.fromNames("process-id:String", "sequenceNumber:Long")
      ),
      (table, _, _, _) => ViewPortDef(
        columns = table.getTableDef.columns,
        service = new FixSequenceRpcService()
      )
```

the ProcessRpcService referenced above is defined as follows ...

```scala
class ProcessRpcService(val tableContainer: TableContainer)(implicit clock: Clock) extends RpcHandler{

  private final val FIX_SEQ_RESET_TABLE = "fixSequenceReset"

  private def openEditSeqNum(selection: ViewPortSelection, session: ClientSessionId): ViewPortAction = {

    val baseTable = tableContainer.getTable(FIX_SEQ_RESET_TABLE)

    val sessionTable = tableContainer.createSimpleSessionTable(baseTable, session)

    val row = selection.rowKeyIndex.keys.map(selection.viewPort.table.pullRow(_)).toList.head

    val processId = row.get("id").toString

    sessionTable.processUpdate(processId, RowWithData(processId, Map("process-id" -> processId, "sequenceNumber" -> 0)), clock.now())

    OpenDialogViewPortAction(ViewPortTable(sessionTable.name, sessionTable.tableDef.getModule().name), RenderComponent.InlineForm)
  }

  override def menuItems(): ViewPortMenu = ViewPortMenu("Admin",
    new SelectionViewPortMenuItem("Reset SeqNum", "", this.openEditSeqNum, "OPEN_EDIT_RESET_FIX")
  )
}
```

and, finally, the FixSeqenceRpcService

```scala
class FixSequenceRpcService(implicit clock: Clock) extends RpcHandler with EditRpcHandler{

  def onDeleteRow(key: String, vp: ViewPort, session: ClientSessionId): ViewPortEditAction = {
    ViewPortEditSuccess()
  }

  def onDeleteCell(key: String, column: String, vp: ViewPort, session: ClientSessionId): ViewPortEditAction = {
    ViewPortEditSuccess()
  }

  def onAddRow(key: String, data: Map[String, Any], vp: ViewPort, session: ClientSessionId): ViewPortEditAction = {
    ViewPortEditSuccess()
  }

  private def onEditCell(key: String, columnName: String, data: Any, vp: ViewPort, session: ClientSessionId): ViewPortEditAction = {
    val table = vp.table.asTable
    table.processUpdate(key, RowWithData(key, Map(columnName -> data)), clock.now())
    ViewPortEditSuccess()
  }

  private def onEditRow(key: String, row: Map[String, Any], vp: ViewPort, session: ClientSessionId): ViewPortEditAction = {
    val table = vp.table.asTable
    table.processUpdate(key, RowWithData(key, row), clock.now())
    ViewPortEditSuccess()
  }

  private def onFormSubmit(vp: ViewPort, session: ClientSessionId): ViewPortAction = {
    val table = vp.table.asTable
    val primaryKeys = table.primaryKeys
    val headKey = primaryKeys.head
    val sequencerNumber = table.pullRow(headKey).get("sequenceNumber").asInstanceOf[Long]

    if (sequencerNumber > 0) {
      logger.info("I would now send this fix seq to a fix engine to reset, we're all good:" + sequencerNumber)
      CloseDialogViewPortAction(vp.id)
    } else {
      logger.error("Seq number not set, returning error")
      ViewPortEditFailure("Sequencer number has not been set.")
    }
  }

  private def onFormClose(vp: ViewPort, session: ClientSessionId): ViewPortAction = {
    CloseDialogViewPortAction(vp.id)
  }

  override def deleteRowAction(): ViewPortDeleteRowAction = ViewPortDeleteRowAction("", this.onDeleteRow)
  override def deleteCellAction(): ViewPortDeleteCellAction = ViewPortDeleteCellAction("", this.onDeleteCell)
  override def addRowAction(): ViewPortAddRowAction = ViewPortAddRowAction("", this.onAddRow)
  override def editCellAction(): ViewPortEditCellAction = ViewPortEditCellAction("", this.onEditCell)
  override def editRowAction(): ViewPortEditRowAction = ViewPortEditRowAction("", this.onEditRow)
  override def onFormSubmit(): ViewPortFormSubmitAction = ViewPortFormSubmitAction("", this.onFormSubmit)
  override def onFormClose(): ViewPortFormCloseAction = ViewPortFormCloseAction("", this.onFormClose)
}

```
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# RPC Calls

<SvgDottySeparator style={{marginBottom: 32}}/>

## Viewport RPC

```scala
In Progress
```import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# RPC

<SvgDottySeparator style={{marginBottom: 32}}/>

## Overview of RPC

There are two scopes where rpc services can be defined:

- Global Scope - these are services that can be called without a viewport being created.
- Viewport Scope - these are services that are created when a user creates a viewport

## Global Scope - RPC Services

[RPC Services](service.md) allow us to expose server-side functionality to a Vuu client over a low-latency web-socket connection.

The Vuu client framework can discover and programmatically call these services over the WebSocket. While there is no generic UI for invoking/inspecting REST services, many components (such as the Autocomplete Search) use services as an implementation mechanism.

## Global Scope - REST Services

REST Services allow us to expose server-side functionality to a Vuu client. Each service is modeled in REST-ful resource fashion, and can define the following standard verbs: `get_all`, `get`, `post`, `put`, `delete`

## Viewport Scope - Menu Items

[Menu Items](Menu_items.md) act upon a `table`, `selection`, `row` or `cell` (these are called `scope`).

Once a `menu item` is registered by a server side [`provider`](../providers_tables_viewports/providers.md), it will be automatically displayed when user right-clicks on the corresponding Vuu Grid component.

Menu items may have filter expressions (applied for each individual row) that determine for which rows they are visible. If a menu item is visible, it can be invoked. On invocation, depending on the `scope` the RPC handler will receive context information about what are we acting upon.

## Viewport Scope - RPC Calls

[Viewport RPC](Viewport_rpc.md) calls are specific service methods that we want to call on a viewport we've created. They are specific i.e. the UI component needs
to understand the type of call that is being called. In that way they should be used in functionally specific UI components.

They implicitly have access to the viewport and its associated tables that they are being called on.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# RPC Services

<SvgDottySeparator style={{marginBottom: 32}}/>

The best way to describe service rpc calls is with an example. In the default React grid for Vuu, we have the filter
component. The filter uses an ALNTR grammar for defining how we want to filter the data. Examples of how we use this are:

```
ric = AAA.L
//or
exchange in [XLON, XAMS, NYSE]
```

You may have noticed when you type in the filter in the grid you get a typeahead hint for the available values. If I had
typed "exchange in [" the UI offers up to 10 values based on the contents of the tables.

These suggestions are implemented as an RPC service within the type ahead module:

```scala

object TypeAheadModule extends DefaultModule {

  final val NAME = "TYPEAHEAD"

  def apply()(implicit clock: Clock, lifecycle: LifecycleContainer): ViewServerModule = {
    ModuleFactory.withNamespace(NAME)
      .addRpcHandler(server => new TypeAheadRpcHandlerImpl(server.tableContainer))
      .asModule()
  }
}
```

You can see we've defined an RpcHandler called TypeAheadRpcHandlerImpl, which implements the interface:

```scala
trait TypeAheadRpcHandler{
  def getUniqueFieldValues(tableMap: Map[String, String], column: String, ctx: RequestContext): Array[String]
  def getUniqueFieldValuesStartingWith(tableMap: Map[String, String], column: String, starts: String, ctx: RequestContext): Array[String]
}
```

These two calls are called by the search bar when it is trying to get a list of unique values within a column in a table on the server.

The calling of these rpc calls is specifically coded into the React control as behaviour. Then these modules allow us the aility to call it without
having to interfere with the core of the server.
# Authentication

```
Work in Progress....
```
# Authorisation

```
Work in Progress....
```
# Security

```
Work in Progress....
```
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Join Manager

<SvgDottySeparator style={{marginBottom: 32}}/>

The Join Manager receives row updates from underlying tables, and propagates the join rows as necessary to view ports.

As an example, say we had the tables:

```
Product (simple table)
---------
Id
Description
Currency

and

Order (simple table)
----------
Id
Quantity
ProductId
UserName

OrderDetail (join table)
----------
OrderId
ProductId
Quanity
UserName
Currency
```

The relationship is one to many for products to orders (i.e. many orders can be executed on a single product.)

When we get an update through for a product, id = 1, what we want to do is check our data structure internally to see which orders
have a foreignKey productId = 1, say we find 3, then we want to propagate an event for each orderdetail row to the viewport for those rows.

This mapping between tables and the multiplication of the event based on join logic is what the join manager does.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Server Internals

<SvgDottySeparator style={{marginBottom: 32}}/>

- [The Tick Path and the Slow Path](./tickpath.md)
- [ViewPort Thread(s)](./viewport_thread.md)
- [Join Manager](./join_manager.md)
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# The Tick Path

<SvgDottySeparator style={{marginBottom: 32}}/>

Vuu is designed to favour an update to an existing row over the addition or removal of a row.

What does this mean in practice? Well, an update to a row will be passed through to the viewport in the same thread
as the processUpdate() call in the provider (there are some exclusions to this, for example if you are using a joinTable for the viewport.)

Changes to the contents of a viewport (i.e. the keys that compose it) are done on the sort and filter thread. That takes
the underlying table, applies the sorts and filters and publishes them through to the viewport.

Assuming the tables you are operating on are not enormous (< 3m rows say), the difference will be imperceptible but it is
an important concept in understanding how the vuu server works.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# ViewPort Thread(s)

<SvgDottySeparator style={{marginBottom: 32}}/>

```
Work in Progress....
```
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Aggregates

<SvgDottySeparator style={{marginBottom: 32}}/>

Aggregates are mathematical operations we perform on the leaf nodes within a tree, that we want to display on the branch
rows of a tree.

Typically, aggregrates are used to display sums or counts of values, we support the following types:

| Aggregate Type | Value | Description                                           |
| -------------- | ----- | ----------------------------------------------------- |
| Sum            | 1     | Sum of values in field of child                       |
| Average        | 2     | Average of a numerical value                          |
| Count          | 3     | Count of distint values (can be used in non numerics) |
| High           | 4     | Math.max(column)                                      |
| Low            | 5     | Math.min(column)                                      |
| Distinct       | 6     | Concatenates distinct column values, comma separated  |

Below is a sample of the UI with a sum aggregate on the filled quantity and quantity columns.

![Aggregates](./aggregates.png)
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Tree Builder

<SvgDottySeparator style={{marginBottom: 32}}/>

The Tree Builder is a component that sits on a separate thread, in a similar manner to the Filter and Sort functionality in the viewport container.
Its purpose is to, each cycle, produce a tree'd representation of an underlying table and to generate the tree-keys for the underlying
table keys.

The tree keys are injected into the viewport in the same way normal keys are injected into flat viewports.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Trees

<SvgDottySeparator style={{marginBottom: 32}}/>

Trees are a specialized views onto tables that live within specific users viewports. Trees are built on a separate thread
in a very similar manner to sorts and filters, but instead of creating a flat array of keys the output of the tree builder
is a tree where the leaf nodes are the keys.

When a viewport is changed to be tree'd the keys in the viewport are changed to be Tree Keys. Tree keys have mappings back to underlying rows
in the flat table in the data structure.
Also additional information is added to the table to denote whether a branch node is open or closed,
and how deep the specific tree key is indented in the structure.

Tree's are represented in a specific type of table TreeSessionTable, which unlike other tree's lives within a users viewport
and is a derivation on an underlying table. When the viewport is closed the TreeTable is deleted.

```
//Pre Tree'd Viewport:

Keys = [
    "order-001"
    "order-002"
    "order-003"
    "order-004"
]
```

```
//Post Tree'd Viewport keys, after we have tree'd by RIC
Keys = [
    "$root/AAPL"             //branch, isOpen = true, indent = 1
    "$root/AAPL/order-001"
    "$root/AAPL/order-002"
    "$root/GOOG"             //branch, isOpen = true , indent = 1
    "$root/GOOG/order-003"
    "$root/GOOG/order-004"
]
```

From the picture below you can see a grid that has been tree'd on two fields (exchange and currency)

![Trees](treed-instruments.png)

If you look at the update messages sent across the websocket you will see that tree updates have additional columns within the data packet, specifically:

```json
{
  "requestId": "",
  "sessionId": "SESS-83321475-45ef-486c-99a9-cce1ccc28b34",
  "token": "",
  "user": "user",
  "body": {
    "type": "TABLE_ROW",
    "batch": "REQ-5",
    "isLast": true,
    "timeStamp": 1642946459556,
    "rows": [
      {
        "viewPortId": "user-VP-00000000",
        "vpSize": 4,
        "rowIndex": 2,
        "rowKey": "$root|XNYS/NYS-MAIN",
        "updateType": "U",
        "ts": 1642946459556,
        "sel": 0,
        "vpVersion": "3",
        "data": [
          1,
          false,
          "$root|XNYS/NYS-MAIN",
          false,
          "XNYS/NYS-MAIN",
          123032,
          "",
          "",
          "",
          "XNYS/NYS-MAIN",
          "",
          "1000",
          ""
        ]
      },
      {
        "viewPortId": "user-VP-00000000",
        "vpSize": 4,
        "rowIndex": 0,
        "rowKey": "$root|XLON/LSE-SETS",
        "updateType": "U",
        "ts": 1642946459556,
        "sel": 0,
        "vpVersion": "3",
        "data": [
          1,
          false,
          "$root|XLON/LSE-SETS",
          false,
          "XLON/LSE-SETS",
          17576,
          "",
          "",
          "",
          "XLON/LSE-SETS",
          "",
          "1000",
          ""
        ]
      },
      {
        "viewPortId": "user-VP-00000000",
        "vpSize": 4,
        "rowIndex": 3,
        "rowKey": "$root|XAMS/ENA-MAIN",
        "updateType": "U",
        "ts": 1642946459556,
        "sel": 0,
        "vpVersion": "3",
        "data": [
          1,
          false,
          "$root|XAMS/ENA-MAIN",
          false,
          "XAMS/ENA-MAIN",
          17576,
          "",
          "",
          "",
          "XAMS/ENA-MAIN",
          "",
          "1000",
          ""
        ]
      },
      {
        "viewPortId": "user-VP-00000000",
        "vpSize": 4,
        "rowIndex": 1,
        "rowKey": "$root|XNGS/NAS-GSM",
        "updateType": "U",
        "ts": 1642946459556,
        "sel": 0,
        "vpVersion": "3",
        "data": [
          1,
          false,
          "$root|XNGS/NAS-GSM",
          false,
          "XNGS/NAS-GSM",
          17576,
          "",
          "",
          "",
          "XNGS/NAS-GSM",
          "",
          "1000",
          ""
        ]
      }
    ]
  },
  "module": "CORE"
}
```

you'll see there are an additional 6 fields added to each row, these are:

- depth - what is the depth of this node in the tree (this is used to determine how to render the row)
- tree.isOpen(this) - boolean: is the node state open or closed (if its a branch)
- key - the treeKey value for this row
- isLeaf - boolean: is this a leaf
- originalKey - original row key, before tree'ing
- children.size()) - number of children at the next level below it

These fields allow us to render a tree on the client when the client only has a viewported window over the data set rather
than the full data.
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Trees

<SvgDottySeparator style={{marginBottom: 32}}/>

In this section you can read about:

- [Trees](trees.md) - the datastructures used, how the system looks
- [Aggregates](aggregates.md) - these are mathematical operations we want to do across the leaves of a tree, which are displayed at teh branch level
- [Tree Builder](tree_builder.md) - the server side component that builds the trees
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Calculated Columns

<SvgDottySeparator style={{marginBottom: 32}}/>

Implemented in issue [#345](https://github.com/venuu-io/vuu/issues/345)

### Introduction

Calculated columns are a way for a user to enhance an existing viewport by adding columns dynamically and saving the definition of these columns with the viewport definition.

Examples of when you might want to use calculated columns are:

1. Creating a mathematical operation between existing columns

```
//if I wanted to create a column that is notional value of a row in USD, I could define it terms of the existing columns.
notionalInUsd "=price * quantity * fxToUSD"
```

2. A logical operation to identify data for filtering:

```
//if I wanted to have a custom field called "key clints" I might define it as
keyClients "=clientName in [FOO, BAR]"
returning true/false
```

### Requirements

Because there is a cost to calculating columns, the best style of implementation would involve parsing the expression
into some style of AST, and then evaluating that each time a row update was being realised by sending down the viewport.

This would also naturally throttle the quantity of updates.

The definition of this calculated column would have to be passed to the server in either the create viewport or change viewport
call in the JSON definition. It would need to be saved alongside the viewport JSON definition.

The calculated column would at minimum need to contain:

```json
{ "columnName": "", "calculation": "", "dataType": "" }
```

though datatype might be surplus or could be inferred.

**Question:** How would we infer datatype? How would we cater for nasty expressions like "= price _ clientName"? possible we could error. We could use
precendence in the datatypes, i.e. first column sets return value.? Or we could look for widest type in the event it was int _ double or int \* long.
It would likely be porr UX to ask the user to define the return type.

### Use in Tree'd Viewports

By default calculated columns would work the same in tree'd viewports as in non-tree'd viewports. THe only caveat to that
would be when the calculated column would be a branch in the tree. In that case the column values would have to be calcuated in the
tree building function, which may slow down tree generation for specific viewports.

### Implementation

Calculated columns are defined as a column in the CreateViewPortRequest and the ChangeViewPortRequest. Whereas a normal request might only contain column names:

```json
//below is a vanilla example of a change vp message
VanillaExample: {"requestId":"1234","sessionId":"9097","token":"fe772f","user":"user","body":{"type":"CHANGE_VP","viewPortId":"user-d28fd","columns":["ask","askSize","bid","bidSize","close","last","open","phase","ric","scenario"],"sort":{"sortDefs":[]},"groupBy":["ric"],"filterSpec":null,"aggregations":[]},"module":"CORE"}
//then we have a calulated column example                                                                                                                                                                                                //calc'd columns
CalcColumnExample: {"requestId":"1234","sessionId":"9097","token":"fe772f","user":"user","body":{"type":"CHANGE_VP","viewPortId":"user-d28fd","columns":["ask","askSize","bid","bidSize","close","last","open","phase","ric","scenario", "askNotional:Long:=ask*askSize", "bidNotional:Long:=bid*bidSize"],"sort":{"sortDefs":[]},"groupBy":["ric"],"filterSpec":null,"aggregations":[]},"module":"CORE"}
```

You can see in the column description we have specified 3 fields separated by a colon, in the form: **fieldName:dataType:calculation**

When this instruction is received by the server it splits the field into its constituent parts and adds this specialized type of column to the ViewPortColumns object. Going forward only the fieldName will be returned when data is sent from the server.

### Supported Operators And Functions

Basic mathematical operators are implemented as you'd expect, some examples of this are:

All unquoted strings (such as bid, price, quantity etc below) are assumed to be column identifiers in the table and will be resolved.

```
        "=or(starts(orderId, \"NYC\"), min(120, quantity) > 122)",
        "=if(price > 100, \"true\", \"false\")",
        "=bid",
        "=200",
        "=bid+(price*quantity)",
        "=(price*quantity)*bid",
        "=price*quantity*bid",
        "=(i1-i2)-i3",
        "=(bid*ask)+(price-quantity)",
        "=(bid*100)+(price-50)",
        "=bid*100+price-50",
        "=bid*100.00+price-50.0*bid/price",
        "=price*quantity",
        "=(bid + ask) / 2",
        "=min(min(i1, i3), i2)",
        "=min(i1, i2)",
        "=text(i1, i2)",
        "=max(100, 200, 300)",
        "=concatenate(max(i1, i2), text(quantity))",s
```

In this case numeric data types returned from each clause are inferred by the widest field (i.e. boolean to int to long or double)

Inputs into functions can be:

- String or numeric, or boolean literals: "test1", 100, true, 100.01
- Field references from the table row: price
- Other functions: =if(search(customerName, "ABC"), true, false)

| Category | Function    | Example                                 | Result           | Return Type                                    | Notes                                                      |
| :------- | :---------- | :-------------------------------------- | ---------------- | ---------------------------------------------- | :--------------------------------------------------------- |
| Strings  | len         | =len("example")                         | 7                | Integer                                        | if used on non string field, toString will be called first |
|          | concatenate | =concatenate("example", "-test")        | "example-test"   | String - uppercase representation of field     |                                                            |
|          | upper       | =upper("example")                       | "EXAMPLE"        | String - uppercase representation of field     |                                                            |
|          | lower       | =lower("examPLE")                       | "example"        | String                                         |                                                            |
|          | left        | =left("example", 3)                     | "exa"            | String                                         |                                                            |
|          | right       | =right("example", 3)                    | "ple"            | String                                         |                                                            |
|          | replace     | =replace("exampleexample", "ex", "Foo") | FooampleFooample | String                                         |                                                            |
|          | text        | =text(12345)                            | "12345"          | String                                         |                                                            |
|          | contains    | =contains("example", "pl")              | true             | Boolean                                        |                                                            |
|          | starts      | =starts("example", "ex")                | true             | Boolean                                        |                                                            |
|          | ends        | =ends("example", "ple")                 | true             | Boolean                                        |                                                            |
| Math     | min         | =min(100, 101, 102, ...)                | 100              | Integer, Double                                |                                                            |
|          | max         | =max(100, 101, 102, ...)                | 102              | Integer, Double                                |                                                            |
|          | sum         | =sum(100, 101, 102)                     | 303              | Integer, Double                                |                                                            |
| Logic    | if          | =if( 100 > 102, "this", "that")         | "that            | variable, with the return of then else clauses |                                                            |
|          | or          | =or( 1=1, 1=2 )                         | True             | Boolean                                        |                                                            |
|          | and         | =and( 1=2, 1=2, 1=3)                    | False            | Boolean                                        |                                                            |

Functions Coming Soon...

| Category | Function | Example                      | Result | Return Type               | Notes                            |
| :------- | :------- | :--------------------------- | ------ | ------------------------- | :------------------------------- |
| Math     | round    | =round(101.01)               | 100    | Double                    | Equivalent to javas Math.round() |
|          | log10    | =log10(100)                  |        |                           | <<not implemented, coming soon>> |
|          | log      | =log(100)                    |        |                           | <<not implemented, coming soon>> |
|          | sqrt     | =sqrt(24)                    |        |                           | <<not implemented, coming soon>> |
|          | sin      | =sin(1.234)                  |        |                           | <<not implemented, coming soon>> |
|          | cos      | =cos(1.234)                  |        |                           | <<not implemented, coming soon>> |
|          | cosign   | =cosin(field1, field2, 1000) |        |                           | <<not implemented, coming soon>> |
| DateTime | day      | =day(time)                   |        | Long - millis since epoch | <<not implemented, coming soon>> |
|          | month    | =month(time)                 |        | Long - millis since epoch | <<not implemented, coming soon>> |
|          | year     | =year(time)                  |        | Long - millis since epoch | <<not implemented, coming soon>> |

### Null and Error Handling

In general a null combined with another numeric results in a null. A null used in a text function is assumed to be a zero length string, a null in a logic function is always false.

For numeric values 0 is assumed to be false, another other than 0 is assumed to be true (even decimals.)
# Writing Custom Controls

```
Work in Progress....
```
# Fluid UIs

Vuu's frontend is built around the idea of a "Fluid UI." A Fluid UI is the concept that there is no official designation
of how a UI should work or be put together, rather the UI offers a series of components, a layout manager which allows 
the user to drag and drop these components onto their screen, and also the ability to save the users UI state.

These put together mean that every given user should have the ability to create the perfect UI for their requirements.

# But I don't want to create my own UI, I want to copy someone else's...

```
Work in Progress....
```
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Vuu UI Introduction

<SvgDottySeparator style={{marginBottom: 32}}/>

The purpose of the Vuu server is to serve data efficiently to UI clients. The Vuu project provides a number of client side libraries to
make building such UI clients easier. These are published as NPM packages. There are no real constraints on exactly how the UI is built. The libraries provided by Vuu
target the Web platform and the descriptions in this section will be limited to Web based applications.

# How does the application UI consume Vuu data ?

First thing to understand is the basic pattern that defines the Vuu client-server architecture. A single Vuu server instance will serve data to many UI clients. Each of those UI clients will connect to one and only one Vuu server instance. That connection is made over a WebSocket, which allows for efficient two-way communication between client and server. Components are the building blocks of modern UI applications. A single application will generally be composed of many smaller, specialised components. Some of these components will render data from the Vuu server. In the context of a Trading System , an obvious example of such a component would be a Trading Blotter - which is a DataGrid.

The data table is the foundational unit of data storage within the Vuu server, just as the component is the building block of the UI. The expectation is that tables within the Vuu server will be designed to match the needs of the UI and the ideal scenario would be that a single UI component consumes and renders data from a single Vuu table. The `vuu-data` library package provides everything necesary to connect a UI application to a Vuu server and to allow individual UI components to subscribe to data from data tables on that server. To continue the example above, the Trading Blotter will subscribe to a Vuu data table, maybe an Orders table or a Prices table, or a composite table that joins the two. The ability to join tables on the server makes it possible to tailor data tables to the needs of the UI, without unnecessary duplication of data on the server.

Full details of how to use the `vuu-data` package here: [The Vuu Data package](vuu_data.md)

# What Vuu UI packages are available and what do they do ?

[The Vuu Data Table package](vuu_data_table.md)

If an application uses the Vuu server, must the UI be built with Vuu UI components ?

Does Vuu work with Ag Grid ?

[The Vuu Data Ag Grid package](vuu_data_ag_grid.md)

How do I run the Vuu Sample App ?

What Features does Vuu offer for UI development beyond loading data ?

How do I get started with Vuu as a UI developer ?
# Visual Linking

Visual Linking is the process of establishing a parent child relationship (either 1:1 or 1:many) between a parent table and 
a child table in view ports. When rows are selected in the viewport of the parent table, the server side filters results in the child
based on statically defined relationships in the module definition. 

Example:

[SimulationModule.scala](https://github.com/venuu-io/vuu/blob/master/vuu/src/main/scala/io/venuu/vuu/core/module/simul/SimulationModule.scala)

```scala
      .addTable(
        TableDef(
          name = "childOrders",
          keyField = "id",
          Columns.fromNames("parentOrderId".int(), "id".string(), "idAsInt".int(), "ric".string(), "price".double(),
                            "quantity".int(), "side".string(), "account".string(), "exchange".string(), "ccy".string(),
                            "strategy".string(), "volLimit".double(), "filledQty".int(), "openQty".int(), "averagePrice".double(),
                            "status".string(), "lastUpdate".long()),
          //this is the important line...
          VisualLinks(
            Link("parentOrderId", "parentOrders", "idAsInt")
          ),
          indices = Indices(
            Index("parentOrderId"),
            Index("quantity"),
            Index("exchange"),
            Index("ccy"),
          ),
          joinFields = "id", "ric"
        ),
        (table, vs) => new ChildOrdersProvider(table, ordersModel)
      )

```
If you look at this code from our SimulationModule, you can see we've declared a potential link from this table ChildOrders to parentOrders. 
THe structure of the declaration is: Link(fieldInChildTable, parentTable, fieldInParentTable)

Anytime you declare these links, our UI will allow you to select the Visual Linking usimng a right click on the grid. 

# Vuu Data

package name `@finos/vuu-data`

## Introduction

The `vuu-data` package includes everything needed to connect a Web application to a Vuu server. An application will connect to a single Vuu server. There are two important APIs that client code will always use when connecting to a Vuu server:

- connectToServer
- RemoteDataSource

`connectToServer` does exactly what the name suggests, it opens a (WebSocket) connection to the server using the credentials established at login time. This must be called once, and must succeed before any DataSource subscription can be opened.

```JavaScript
import { connectToServer } from "@vuu-ui/vuu-data";


connectToServer({
    authToken: user.token,
    url: serverUrl,
    username: user.username,
});

```

Internally a singleton object, the `ConnectionManager`, orchestrates both the initial connection to the server and then individual table subscriptions made by `DataSource` clients. A WebWorker is created so that data messaging with Vuu is moved off the main UI thread. Within the worker, a WebSocket connection is opened to the server. All messages, across any number of subscriptions, are routed across the same WebSocket connection.

The Vuu server stores data (in memory) in tables. An application may make use of one or many tables. A client will use a `RemoteDataSource` to open a subscription to a single Vuu table. If the client connects to multiple Vuu tables, multiple `RemoteDataSource` instances will be created. This is normally handled at the component level. A UI component, a DataGrid for example, will create a `RemoteDataSource` to load data from the target Vuu table. An application will quite possibly have multiple data-bound UI components, each will create a RemoteDataSource.

It is not uncommon for a UI to host multiple UI components consuming and rendering data from the same server table. For example, an application view may host two DataGrids showing Order data - one filtered to show only cancelled orders, the other showing live orders. Although the underlying Orders table might be the same, these two DataGrid components would still each create their own RemoteDataSource instance. The RemoteDataSource encapsulates all aspects of a client subscription - not just the remote table to which the subscription is made, but also any filtering criteria, sorting criteria, grouping criteria etc applied by the user. In the example above, two subscriptions would be created to the Orders table, but each would have different filtering criteria applied. On the Vuu server, these translate into two Viewports being created on the same underlying table.

## RemoteDataSource

A `RemoteDataSource` manages a client subscription to a single Vuu table. The subscription initiated by the client will provide configuration options to describe the data required. The only mandatory option is the identifier for the table itself. This cannot be changed once the subscription is opened. If the client needs to switch a subscription to a different table, a new `RemoteDataSource` should be created. All other subscription details are optional and can be changed at any time once the subscription is open.

A minimal implementation of RemoteDataSource creation:

```JavaScript
    const ds = new RemoteDataSource({
      table: {module: 'SIMUL', table: 'instruments'},
      columns: ['ric', 'description'],
    });
```

This defines a RemoteDataSource that will (when subscribe is called) create a subscription to the instruments table. When the subscription is opened, data returned by Vuu will be for two columns only, 'ric' and 'description'.

An equally minimalist subscribe call:

```JavaScript
    dataSource.subscribe(
      {
        range: {from: 0, to: 20},
      },
      datasourceMessageHandler
    );
```

The datasourceMessageHandler is a callback function through which all messages from the Vuu server will be routed. It is described below.
The `range` property is important. Vuu provides a movable 'window' into the full serverside dataset. The UI sends `range` to inform the server of the subset of data rows that are currently visible in the UI. If the user scrolls through data, in a DataGrid component for example, updates to the range are sent to the server, which responds with the corresponding data. `range` will be explored in more detail later, when client side data caching is described.

The configuration options that define the data to be loaded are as follows (other configuration options will be described further below):

<table>
<tr><th>Property</th><th>Description</th></tr>
<tr><td>aggregations</td><td>describe how to aggregate values when grouping is in effect</td></tr>
<tr><td>columns</td><td>the set of columns for which client wants to to receive data </td></tr>
<tr><td>filter</td><td>describe any filter(s) to apply to data</td></tr>
<tr><td>groupBy</td><td>if grouping is to be applied to data, describe the columns that should be grouped</td></tr>
<tr><td>range</td><td>the range of data rows currently visible in a scrollable UI</td></tr>
<tr><td>sort</td><td>the list of columns by which data should be sorted</td></tr>
</table>

A few points to understand about the above two code shippets. No interaction with the server happens when the RemoteDataSource itself is created, it simply stores the details provided. Configuration options can be passed either via the `DataSource` constructor or via the `subscribe` method call. The `subscribe` method is asynchronous. It doesn't return a useful result. Rather, messages will be passed to the client via the `datasourceMessageHandler` callback.

The call to `connectToServer` described above must succeed before any subscription will be opened. There is no requirement for the client to manage the sequencing of these operations - if calls are made to `subscribe` before the connection has been opened to the server (or even before `connectToServer` has been called), the `subscribe` calls will block until `connectToServer` is called and the connection is open.

## dataSource.subscribe

When a client calls `subscribe`, a `CREATE_VP` message is sent to the Vuu server. The Vuu server will create a `Viewport` to handle all subsequent interaction on this subscription. A `Viewport` is a lightweight data structure that manages client access to an underlying data table. There is a one-to-one relationship between a server `Viewport` and a client subscription. The `Viewport` is a set of indices that reflect the configuration options provided by the client subscription - sorting, filtering, grouping etc. These indices store pointers to data rows in the underlying data table. Whereas the `Viewport` is unique to a single client subscription, the underlying data tables are shared across all subscriptions and all clients.

One of the key features of Vuu is that it can manage large data tables, but sends to the client only the data currently visible in the browser viewport. If offers a virtualized window into a larger dataset. The `range` value sent by the client drives this. The server will only send data to a client when a `range` is provided and will only send the data rows that correspond to that range. It is only when a range of rows is prepared for delivery to the client that data is loaded from the underlying table, using the indices that comprise the `Viewport`.

## further subscribe options
# Vuu Data Ag Grid
# Vuu Data Table

```
Work in Progress....
```
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Viewport Ack-Nack

<SvgDottySeparator style={{marginBottom: 32}}/>

When using viewports there are certain requirements to be aware of in the protocol. This is especially important when a
change in viewport results in a substantial change in the structure of the data returned, for example switching from
non-tree'd to tree'd data and vice versa.

## The Problem:

The Vuu server is heavily asynchronous internally, so when making changes to a viewport you may get out of date changes coming
down the websocket before a change has been ack'd nack'd by the view server.

As such we need a contract as to how we should handle updates to a viewport which may no longer be valid.

The rules are:

1. When you submit a viewport change request (CHANGE_VP msg), the request id on the message functions like a version number.
2. All updates should be ignored on the wire until a CHANGE_VP_SUCCESS or CHANGE_VP_REJECT has been received for your requestId.
3. Any subsequent updates that are received for your vpId which have a different version to the ACK/NACK'd one should be dropped.

## Sample Flow:

Success Case:

```json
IN: {"requestId":"1234","sessionId":"f17ba634-3f52-400a-9d94-af667cfa9097","token":"6ae37e02-e89c-4223-9801-e57547fe772f","user":"user","body":{"type":"CHANGE_VP","viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","columns":["ask","askSize","bid","bidSize","close","last","open","phase","ric","scenario"],"sort":{"sortDefs":[]},"groupBy":["ric"],"filterSpec":null,"aggregations":[]},"module":"CORE"}
//1233 was the last version, this update should be dropped
OUT: {"requestId":"1233","sessionId":"f17ba634-3f52-400a-9d94-af667cfa9097","token":"","user":"user","body":{"type":"TABLE_ROW","batch":"fed5b89f-dbf3-471f-b25d-893b6da8721c","isLast":true,"timeStamp":1639988606160,"rows":[{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":96,"rowKey":"ALK.N","updateType":"U","ts":1639988606160,"sel":0,"data":[540.35,1800,535.0,1800,"",642.32,"","C","ALK.N","walkBidAsk"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":106,"rowKey":"ALK.A","updateType":"U","ts":1639988606160,"sel":0,"data":[540.35,1800,535.0,1800,"",642.32,"","C","ALK.A","walkBidAsk"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":111,"rowKey":"ALK.L","updateType":"U","ts":1639988606160,"sel":0,"data":[540.35,1800,535.0,1800,"",558.49,"","C","ALK.L","walkBidAsk"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":136,"rowKey":"ACQ.A","updateType":"U","ts":1639988606160,"sel":0,"data":[409.05,1400,405.0,1400,"",642.32,"","C","ACQ.A","fastTick"]}]},"module":"CORE"}
//ACK the VP change, we're all good
OUT: {"requestId":"1234","sessionId":"f17ba634-3f52-400a-9d94-af667cfa9097","token":"6ae37e02-e89c-4223-9801-e57547fe772f","user":"user","body":{"type":"CHANGE_VP_SUCCESS","viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","columns":["ask","askSize","bid","bidSize","close","last","open","phase","ric","scenario"],"sort":{"sortDefs":[]},"groupBy":["ric"],"filterSpec":null},"module":"CORE"}
//this update should be used
OUT: {"requestId":"1234","sessionId":"f17ba634-3f52-400a-9d94-af667cfa9097","token":"","user":"user","body":{"type":"TABLE_ROW","batch":"9f507f7c-24ea-4287-9dd2-01e61b6e8f70","isLast":true,"timeStamp":1639988606280,"rows":[{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":127,"rowKey":"AHX.N","updateType":"U","ts":1639988606280,"sel":0,"data":[452.12,1500,428.0,1500,"",447.12,"","C","AHX.N","fastTick"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":129,"rowKey":"AHX.A","updateType":"U","ts":1639988606280,"sel":0,"data":[457.12,1500,433.0,1500,"",452.12,"","C","AHX.A","fastTick"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":131,"rowKey":"AHX.L","updateType":"U","ts":1639988606280,"sel":0,"data":[419.38,700,307.0,700,"",415.38,"","C","AHX.L","walkBidAsk"]}]},"module":"CORE"}
```

Reject Case:

```json
IN: {"requestId":"1234","sessionId":"f17ba634-3f52-400a-9d94-af667cfa9097","token":"6ae37e02-e89c-4223-9801-e57547fe772f","user":"user","body":{"type":"CHANGE_VP","viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","columns":["ask","askSize","bid","bidSize","close","last","open","phase","ric","scenario"],"sort":{"sortDefs":[]},"groupBy":["ric"],"filterSpec":null,"aggregations":[]},"module":"CORE"}
//1233 was the last version, this update should be dropped
OUT: {"requestId":"1233","sessionId":"f17ba634-3f52-400a-9d94-af667cfa9097","token":"","user":"user","body":{"type":"TABLE_ROW","batch":"fed5b89f-dbf3-471f-b25d-893b6da8721c","isLast":true,"timeStamp":1639988606160,"rows":[{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":96,"rowKey":"ALK.N","updateType":"U","ts":1639988606160,"sel":0,"data":[540.35,1800,535.0,1800,"",642.32,"","C","ALK.N","walkBidAsk"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":106,"rowKey":"ALK.A","updateType":"U","ts":1639988606160,"sel":0,"data":[540.35,1800,535.0,1800,"",642.32,"","C","ALK.A","walkBidAsk"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":111,"rowKey":"ALK.L","updateType":"U","ts":1639988606160,"sel":0,"data":[540.35,1800,535.0,1800,"",558.49,"","C","ALK.L","walkBidAsk"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":136,"rowKey":"ACQ.A","updateType":"U","ts":1639988606160,"sel":0,"data":[409.05,1400,405.0,1400,"",642.32,"","C","ACQ.A","fastTick"]}]},"module":"CORE"}
//ACK the VP change, we're all good
OUT: {"requestId":"1234","sessionId":"f17ba634-3f52-400a-9d94-af667cfa9097","token":"6ae37e02-e89c-4223-9801-e57547fe772f","user":"user","body":{"type":"CHANGE_VP_REJECT","viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","columns":["ask","askSize","bid","bidSize","close","last","open","phase","ric","scenario"],"sort":{"sortDefs":[]},"groupBy":["ric"],"filterSpec":null},"module":"CORE"}
//this update should be used now, as we've reverted back to 1233, change was rejected
OUT: {"requestId":"1233","sessionId":"f17ba634-3f52-400a-9d94-af667cfa9097","token":"","user":"user","body":{"type":"TABLE_ROW","batch":"9f507f7c-24ea-4287-9dd2-01e61b6e8f70","isLast":true,"timeStamp":1639988606280,"rows":[{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":127,"rowKey":"AHX.N","updateType":"U","ts":1639988606280,"sel":0,"data":[452.12,1500,428.0,1500,"",447.12,"","C","AHX.N","fastTick"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":129,"rowKey":"AHX.A","updateType":"U","ts":1639988606280,"sel":0,"data":[457.12,1500,433.0,1500,"",452.12,"","C","AHX.A","fastTick"]},{"viewPortId":"user-8e5dbeb5-e0c6-404c-95eb-0548cb8d28fd","vpSize":68794,"rowIndex":131,"rowKey":"AHX.L","updateType":"U","ts":1639988606280,"sel":0,"data":[419.38,700,307.0,700,"",415.38,"","C","AHX.L","walkBidAsk"]}]},"module":"CORE"}
```
import { SvgDottySeparator } from "@site/src/components/SvgDottySeparator";

# Wire Protocol

<SvgDottySeparator style={{marginBottom: 32}}/>

The wire protocol is JSON based. It requires a user to authenticate against the server (Athentication provider is pluggable)
When a user authenticates, a conversation is undertable to send down meta to the client relating to the tables and fields available.

Then in general a view port is requested, the server responds as success or failure and then starts streaming data.

```json
//Authenticate message
11:40:43.300   SVR IN:{"requestId":"","sessionId":null,"token":null,"user":"user","body":{"type":"AUTH","username":"steve","password":"pword"},"module":"CORE"}
11:40:43.312   SVR OUT:{"requestId":"","sessionId":"","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"AUTH_SUCCESS","token":"903d591f-8270-4672-aeb5-c6a6cc48463e"},"module":"CORE"}
//Login
11:40:43.332   SVR IN:{"requestId":"","sessionId":null,"token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"LOGIN","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user"},"module":"CORE"}
11:40:43.339   Sending heartbeat
11:40:43.344   SVR OUT:{"requestId":"","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"LOGIN_SUCCESS","token":"903d591f-8270-4672-aeb5-c6a6cc48463e"},"module":"CORE"}

//heartbeats just check a client is alive
11:40:43.347   Sending heartbeat

11:40:43.363   SVR IN:{"requestId":"NA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"HB_RESP","ts":1639654843348},"module":"CORE"}

//Get Meta Data From the Server for the available tables
11:40:43.371   SVR IN:{"requestId":"sAvdxZ6pdU4nrpRv7sb2O","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_LIST"},"module":"CORE"}
11:40:43.383   SVR OUT:{"requestId":"sAvdxZ6pdU4nrpRv7sb2O","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_LIST_RESP","tables":[{"table":"childOrders","module":"SIMUL"},{"table":"instrumentPrices","module":"SIMUL"},{"table":"instruments","module":"SIMUL"},{"table":"metricsGroupBy","module":"METRICS"},{"table":"metricsTables","module":"METRICS"},{"table":"metricsViewports","module":"METRICS"},{"table":"orderEntry","module":"SIMUL"},{"table":"orderEntryPrices","module":"SIMUL"},{"table":"orders","module":"SIMUL"},{"table":"ordersPrices","module":"SIMUL"},{"table":"parentOrders","module":"SIMUL"},{"table":"prices","module":"SIMUL"},{"table":"uiState","module":"vui"}]},"module":"CORE"}
11:40:43.422   SVR IN:{"requestId":"YsU4Ez1h2r9M39Znm7M11","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"childOrders","module":"SIMUL"}},"module":"CORE"}
11:40:43.430   SVR OUT:{"requestId":"YsU4Ez1h2r9M39Znm7M11","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"childOrders","module":"SIMUL"},"columns":["account","averagePrice","ccy","exchange","filledQty","id","idAsInt","lastUpdate","openQty","parentOrderId","price","quantity","ric","side","status","strategy","volLimit"],"dataTypes":["string","double","string","string","int","string","int","long","int","int","double","int","string","string","string","string","double"],"key":"id"},"module":"CORE"}
11:40:43.440   SVR IN:{"requestId":"SDgI5-OdvyKAHIe2wznso","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"instrumentPrices","module":"SIMUL"}},"module":"CORE"}
11:40:43.443   SVR OUT:{"requestId":"SDgI5-OdvyKAHIe2wznso","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"instrumentPrices","module":"SIMUL"},"columns":["ask","askSize","bbg","bid","bidSize","close","currency","description","exchange","isin","last","lotSize","open","phase","ric","scenario"],"dataTypes":["double","int","string","double","int","double","string","string","string","string","double","int","double","string","string","string"],"key":"ric"},"module":"CORE"}
11:40:43.451   SVR IN:{"requestId":"tkKCGDRn33Z7iHNfLAtfN","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"instruments","module":"SIMUL"}},"module":"CORE"}
11:40:43.453   SVR OUT:{"requestId":"tkKCGDRn33Z7iHNfLAtfN","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"instruments","module":"SIMUL"},"columns":["bbg","currency","description","exchange","isin","lotSize","ric"],"dataTypes":["string","string","string","string","string","int","string"],"key":"ric"},"module":"CORE"}
11:40:43.467   SVR IN:{"requestId":"hAkpGsAj80syrgulZNZtY","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"metricsGroupBy","module":"METRICS"}},"module":"CORE"}
11:40:43.469   SVR OUT:{"requestId":"hAkpGsAj80syrgulZNZtY","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"metricsGroupBy","module":"METRICS"},"columns":["75Perc","99Perc","99_9Perc","id","max","mean","table"],"dataTypes":["long","long","long","string","long","long","string"],"key":"id"},"module":"CORE"}
11:40:43.478   SVR IN:{"requestId":"aljfH5hUnfuB2dMh-Sx6t","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"metricsTables","module":"METRICS"}},"module":"CORE"}
11:40:43.480   SVR OUT:{"requestId":"aljfH5hUnfuB2dMh-Sx6t","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"metricsTables","module":"METRICS"},"columns":["size","table","updateCount","updatesPerSecond"],"dataTypes":["long","string","long","long"],"key":"table"},"module":"CORE"}
11:40:43.488   SVR IN:{"requestId":"DI2q6-K_2OXBBTedP_dm4","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"metricsViewports","module":"METRICS"}},"module":"CORE"}
11:40:43.490   SVR OUT:{"requestId":"DI2q6-K_2OXBBTedP_dm4","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"metricsViewports","module":"METRICS"},"columns":["75Perc","99Perc","99_9Perc","id","max","mean","table"],"dataTypes":["long","long","long","string","long","long","string"],"key":"id"},"module":"CORE"}
11:40:43.498   SVR IN:{"requestId":"XrTBD50H31j4GKOhc45Vn","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"orderEntry","module":"SIMUL"}},"module":"CORE"}
11:40:43.501   SVR OUT:{"requestId":"XrTBD50H31j4GKOhc45Vn","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"orderEntry","module":"SIMUL"},"columns":["clOrderId","orderType","price","priceLevel","quantity","ric"],"dataTypes":["string","string","double","string","double","string"],"key":"clOrderId"},"module":"CORE"}
11:40:43.509   SVR IN:{"requestId":"jRN_6VsIEy0USo9skS6uM","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"orderEntryPrices","module":"SIMUL"}},"module":"CORE"}
11:40:43.511   SVR OUT:{"requestId":"jRN_6VsIEy0USo9skS6uM","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"orderEntryPrices","module":"SIMUL"},"columns":["ask","askSize","bid","bidSize","clOrderId","close","last","open","orderType","phase","price","priceLevel","quantity","ric","scenario"],"dataTypes":["double","int","double","int","string","double","double","double","string","string","double","string","double","string","string"],"key":"clOrderId"},"module":"CORE"}
11:40:43.524   SVR IN:{"requestId":"oZ1-kvAUk5HVIEhV1P6-q","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"orders","module":"SIMUL"}},"module":"CORE"}
11:40:43.526   SVR OUT:{"requestId":"oZ1-kvAUk5HVIEhV1P6-q","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"orders","module":"SIMUL"},"columns":["ccy","created","filledQuantity","lastUpdate","orderId","quantity","ric","side","trader"],"dataTypes":["string","long","double","long","string","double","string","char","string"],"key":"orderId"},"module":"CORE"}
11:40:43.535   SVR IN:{"requestId":"ucbUT3-8XGmPGn1MnBcIA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"ordersPrices","module":"SIMUL"}},"module":"CORE"}
11:40:43.537   SVR OUT:{"requestId":"ucbUT3-8XGmPGn1MnBcIA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"ordersPrices","module":"SIMUL"},"columns":["ask","askSize","bid","bidSize","ccy","close","created","filledQuantity","last","lastUpdate","open","orderId","phase","quantity","ric","scenario","side","trader"],"dataTypes":["double","int","double","int","string","double","long","double","double","long","double","string","string","double","string","string","char","string"],"key":"orderId"},"module":"CORE"}
11:40:43.544   SVR IN:{"requestId":"wg5c3eNXt8TsMWabtmeXP","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"parentOrders","module":"SIMUL"}},"module":"CORE"}
11:40:43.545   SVR OUT:{"requestId":"wg5c3eNXt8TsMWabtmeXP","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"parentOrders","module":"SIMUL"},"columns":["account","algo","averagePrice","ccy","childCount","exchange","filledQty","id","idAsInt","lastUpdate","openQty","price","quantity","ric","side","status","volLimit"],"dataTypes":["string","string","double","string","int","string","int","string","int","long","int","double","int","string","string","string","double"],"key":"id"},"module":"CORE"}
11:40:43.552   SVR IN:{"requestId":"n7TWsysUlnllXUbkR47Fu","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"prices","module":"SIMUL"}},"module":"CORE"}
11:40:43.554   SVR OUT:{"requestId":"n7TWsysUlnllXUbkR47Fu","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"prices","module":"SIMUL"},"columns":["ask","askSize","bid","bidSize","close","last","open","phase","ric","scenario"],"dataTypes":["double","int","double","int","double","double","double","string","string","string"],"key":"ric"},"module":"CORE"}
11:40:43.561   SVR IN:{"requestId":"Ml4LjjyR69O5IJMwcFTxc","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_TABLE_META","table":{"table":"uiState","module":"vui"}},"module":"CORE"}
11:40:43.563   SVR OUT:{"requestId":"Ml4LjjyR69O5IJMwcFTxc","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"TABLE_META_RESP","table":{"table":"uiState","module":"vui"},"columns":["id","lastUpdate","uniqueId","user"],"dataTypes":["string","long","string","string"],"key":"uniqueId"},"module":"CORE"}

11:40:43.570   SVR IN:{"requestId":"NA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"HB_RESP","ts":1639654843565},"module":"CORE"}

//Create a new Viewport
11:40:47.885   SVR IN:{"requestId":"rCmauE_Z0bXsKiu6TDG-V","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"CREATE_VP","table":{"table":"instruments","module":"SIMUL"},"range":{"from":0,"to":443},"columns":["bbg","currency","description","exchange","isin","lotSize","ric"],"sort":{"sortDefs":[]},"groupBy":[],"filterSpec":{"filter":""},"aggregations":[]},"module":"CORE"}
11:40:47.898   SVR OUT:{"requestId":"rCmauE_Z0bXsKiu6TDG-V","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"CREATE_VP_SUCCESS","viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","table":"instruments","range":{"from":0,"to":443},"columns":["bbg","currency","description","exchange","isin","lotSize","ric"],"sort":{"sortDefs":[]},"groupBy":[],"filterSpec":{"filter":""}},"module":"CORE"}

11:40:47.908   SVR IN:{"requestId":"1","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_VP_VISUAL_LINKS","vpId":"user-7d96f487-7cda-49e7-b92c-ba4915318528"},"module":"CORE"}
11:40:47.914   SVR OUT:{"requestId":"1","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"VP_VISUAL_LINKS_RESP","vpId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","links":[]},"module":"CORE"}
11:40:47.924   SVR IN:{"requestId":"2","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"GET_VIEW_PORT_MENUS","vpId":"user-7d96f487-7cda-49e7-b92c-ba4915318528"},"module":"CORE"}
11:40:47.936   SVR OUT:{"requestId":"2","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"VIEW_PORT_MENUS_RESP","vpId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","menu":{"name":"Test Menu","menus":[{"name":"Add Rows To Orders","filter":"","rpcName":"ADD_ROWS_TO_ORDERS","context":"selected-rows"},{"name":"Test Selection","filter":"","rpcName":"TEST_SELECT","context":"selected-rows"},{"name":"Test Cell","filter":"","rpcName":"TEST_CELL","context":"cell"},{"name":"Test Table","filter":"","rpcName":"TEST_TABLE","context":"grid"},{"name":"Test Row","filter":"","rpcName":"TEST_ROW","context":"row"}]}},"module":"CORE"}

//data from the server to populate the grid (with bounds)
11:40:47.953   ASYNC-SVR-OUT:{"requestId":"NA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"","user":"user","body":{"type":"TABLE_ROW","batch":"36922aea-ad02-4eae-9a09-10f0a4bb1297","isLast":true,"timeStamp":1639654847947,"rows":[{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":-1,"rowKey":"SIZE","updateType":"SIZE","ts":1639654847946,"sel":0,"data":[]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":0,"rowKey":"AAA.L","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA LN","USD","AAA.L London PLC","XLON/LSE-SETS","",633,"AAA.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":1,"rowKey":"AAA.N","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA US","EUR","AAA.N Corporation","XNGS/NAS-GSM","",220,"AAA.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":2,"rowKey":"AAA.OQ","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA OQ","EUR","AAA.OQ Co.","XNYS/NYS-MAIN","",393,"AAA.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":3,"rowKey":"AAA.AS","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA NL","GBX","AAA.AS B.V","XAMS/ENA-MAIN","",449,"AAA.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":4,"rowKey":"AAA.OE","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA OE","GBX","AAA.OE Co.","XNYS/NYS-MAIN","",37,"AAA.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":5,"rowKey":"AAA.MI","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA MI","CAD","AAA.MI Co.","XNYS/NYS-MAIN","",38,"AAA.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":6,"rowKey":"AAA.A","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA A","GBX","AAA.A Co.","XNYS/NYS-MAIN","",286,"AAA.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":7,"rowKey":"AAA.PA","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA PA","USD","AAA.PA Co.","XNYS/NYS-MAIN","",364,"AAA.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":8,"rowKey":"AAA.MC","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA MC","EUR","AAA.MC Co.","XNYS/NYS-MAIN","",12,"AAA.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":9,"rowKey":"AAA.DE","updateType":"U","ts":1639654847947,"sel":0,"data":["AAA DE","CAD","AAA.DE Co.","XNYS/NYS-MAIN","",927,"AAA.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":10,"rowKey":"AAB.L","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB LN","GBX","AAB.L London PLC","XLON/LSE-SETS","",559,"AAB.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":11,"rowKey":"AAB.N","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB US","CAD","AAB.N Corporation","XNGS/NAS-GSM","",946,"AAB.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":12,"rowKey":"AAB.OQ","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB OQ","CAD","AAB.OQ Co.","XNYS/NYS-MAIN","",363,"AAB.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":13,"rowKey":"AAB.AS","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB NL","CAD","AAB.AS B.V","XAMS/ENA-MAIN","",696,"AAB.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":14,"rowKey":"AAB.OE","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB OE","EUR","AAB.OE Co.","XNYS/NYS-MAIN","",806,"AAB.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":15,"rowKey":"AAB.MI","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB MI","GBX","AAB.MI Co.","XNYS/NYS-MAIN","",44,"AAB.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":16,"rowKey":"AAB.A","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB A","GBX","AAB.A Co.","XNYS/NYS-MAIN","",226,"AAB.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":17,"rowKey":"AAB.PA","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB PA","GBX","AAB.PA Co.","XNYS/NYS-MAIN","",54,"AAB.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":18,"rowKey":"AAB.MC","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB MC","USD","AAB.MC Co.","XNYS/NYS-MAIN","",618,"AAB.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":19,"rowKey":"AAB.DE","updateType":"U","ts":1639654847947,"sel":0,"data":["AAB DE","CAD","AAB.DE Co.","XNYS/NYS-MAIN","",643,"AAB.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":20,"rowKey":"AAC.L","updateType":"U","ts":1639654847947,"sel":0,"data":["AAC LN","GBX","AAC.L London PLC","XLON/LSE-SETS","",690,"AAC.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":21,"rowKey":"AAC.N","updateType":"U","ts":1639654847947,"sel":0,"data":["AAC US","CAD","AAC.N Corporation","XNGS/NAS-GSM","",623,"AAC.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":22,"rowKey":"AAC.OQ","updateType":"U","ts":1639654847947,"sel":0,"data":["AAC OQ","USD","AAC.OQ Co.","XNYS/NYS-MAIN","",167,"AAC.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":23,"rowKey":"AAC.AS","updateType":"U","ts":1639654847947,"sel":0,"data":["AAC NL","EUR","AAC.AS B.V","XAMS/ENA-MAIN","",410,"AAC.AS"]}]},"module":"CORE"}
11:40:47.965   ASYNC-SVR-OUT:{"requestId":"NA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"","user":"user","body":{"type":"TABLE_ROW","batch":"31a0a1c3-c012-4e23-b330-67e95a791e25","isLast":true,"timeStamp":1639654847957,"rows":[{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":24,"rowKey":"AAC.OE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAC OE","EUR","AAC.OE Co.","XNYS/NYS-MAIN","",928,"AAC.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":25,"rowKey":"AAC.MI","updateType":"U","ts":1639654847955,"sel":0,"data":["AAC MI","GBX","AAC.MI Co.","XNYS/NYS-MAIN","",900,"AAC.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":26,"rowKey":"AAC.A","updateType":"U","ts":1639654847955,"sel":0,"data":["AAC A","CAD","AAC.A Co.","XNYS/NYS-MAIN","",896,"AAC.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":27,"rowKey":"AAC.PA","updateType":"U","ts":1639654847955,"sel":0,"data":["AAC PA","USD","AAC.PA Co.","XNYS/NYS-MAIN","",934,"AAC.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":28,"rowKey":"AAC.MC","updateType":"U","ts":1639654847955,"sel":0,"data":["AAC MC","USD","AAC.MC Co.","XNYS/NYS-MAIN","",553,"AAC.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":29,"rowKey":"AAC.DE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAC DE","EUR","AAC.DE Co.","XNYS/NYS-MAIN","",879,"AAC.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":30,"rowKey":"AAD.L","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD LN","GBX","AAD.L London PLC","XLON/LSE-SETS","",943,"AAD.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":31,"rowKey":"AAD.N","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD US","GBX","AAD.N Corporation","XNGS/NAS-GSM","",303,"AAD.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":32,"rowKey":"AAD.OQ","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD OQ","CAD","AAD.OQ Co.","XNYS/NYS-MAIN","",430,"AAD.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":33,"rowKey":"AAD.AS","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD NL","EUR","AAD.AS B.V","XAMS/ENA-MAIN","",628,"AAD.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":34,"rowKey":"AAD.OE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD OE","CAD","AAD.OE Co.","XNYS/NYS-MAIN","",720,"AAD.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":35,"rowKey":"AAD.MI","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD MI","EUR","AAD.MI Co.","XNYS/NYS-MAIN","",478,"AAD.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":36,"rowKey":"AAD.A","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD A","CAD","AAD.A Co.","XNYS/NYS-MAIN","",759,"AAD.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":37,"rowKey":"AAD.PA","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD PA","GBX","AAD.PA Co.","XNYS/NYS-MAIN","",697,"AAD.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":38,"rowKey":"AAD.MC","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD MC","EUR","AAD.MC Co.","XNYS/NYS-MAIN","",68,"AAD.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":39,"rowKey":"AAD.DE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAD DE","GBX","AAD.DE Co.","XNYS/NYS-MAIN","",199,"AAD.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":40,"rowKey":"AAE.L","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE LN","USD","AAE.L London PLC","XLON/LSE-SETS","",873,"AAE.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":41,"rowKey":"AAE.N","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE US","EUR","AAE.N Corporation","XNGS/NAS-GSM","",951,"AAE.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":42,"rowKey":"AAE.OQ","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE OQ","EUR","AAE.OQ Co.","XNYS/NYS-MAIN","",793,"AAE.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":43,"rowKey":"AAE.AS","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE NL","USD","AAE.AS B.V","XAMS/ENA-MAIN","",382,"AAE.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":44,"rowKey":"AAE.OE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE OE","GBX","AAE.OE Co.","XNYS/NYS-MAIN","",578,"AAE.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":45,"rowKey":"AAE.MI","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE MI","CAD","AAE.MI Co.","XNYS/NYS-MAIN","",328,"AAE.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":46,"rowKey":"AAE.A","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE A","EUR","AAE.A Co.","XNYS/NYS-MAIN","",76,"AAE.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":47,"rowKey":"AAE.PA","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE PA","CAD","AAE.PA Co.","XNYS/NYS-MAIN","",691,"AAE.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":48,"rowKey":"AAE.MC","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE MC","GBX","AAE.MC Co.","XNYS/NYS-MAIN","",161,"AAE.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":49,"rowKey":"AAE.DE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAE DE","CAD","AAE.DE Co.","XNYS/NYS-MAIN","",57,"AAE.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":50,"rowKey":"AAF.L","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF LN","CAD","AAF.L London PLC","XLON/LSE-SETS","",201,"AAF.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":51,"rowKey":"AAF.N","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF US","USD","AAF.N Corporation","XNGS/NAS-GSM","",432,"AAF.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":52,"rowKey":"AAF.OQ","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF OQ","USD","AAF.OQ Co.","XNYS/NYS-MAIN","",80,"AAF.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":53,"rowKey":"AAF.AS","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF NL","CAD","AAF.AS B.V","XAMS/ENA-MAIN","",903,"AAF.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":54,"rowKey":"AAF.OE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF OE","EUR","AAF.OE Co.","XNYS/NYS-MAIN","",206,"AAF.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":55,"rowKey":"AAF.MI","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF MI","USD","AAF.MI Co.","XNYS/NYS-MAIN","",911,"AAF.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":56,"rowKey":"AAF.A","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF A","CAD","AAF.A Co.","XNYS/NYS-MAIN","",356,"AAF.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":57,"rowKey":"AAF.PA","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF PA","EUR","AAF.PA Co.","XNYS/NYS-MAIN","",211,"AAF.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":58,"rowKey":"AAF.MC","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF MC","CAD","AAF.MC Co.","XNYS/NYS-MAIN","",310,"AAF.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":59,"rowKey":"AAF.DE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAF DE","USD","AAF.DE Co.","XNYS/NYS-MAIN","",654,"AAF.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":60,"rowKey":"AAG.L","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG LN","USD","AAG.L London PLC","XLON/LSE-SETS","",169,"AAG.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":61,"rowKey":"AAG.N","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG US","USD","AAG.N Corporation","XNGS/NAS-GSM","",408,"AAG.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":62,"rowKey":"AAG.OQ","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG OQ","GBX","AAG.OQ Co.","XNYS/NYS-MAIN","",706,"AAG.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":63,"rowKey":"AAG.AS","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG NL","USD","AAG.AS B.V","XAMS/ENA-MAIN","",892,"AAG.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":64,"rowKey":"AAG.OE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG OE","EUR","AAG.OE Co.","XNYS/NYS-MAIN","",568,"AAG.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":65,"rowKey":"AAG.MI","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG MI","EUR","AAG.MI Co.","XNYS/NYS-MAIN","",313,"AAG.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":66,"rowKey":"AAG.A","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG A","USD","AAG.A Co.","XNYS/NYS-MAIN","",607,"AAG.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":67,"rowKey":"AAG.PA","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG PA","CAD","AAG.PA Co.","XNYS/NYS-MAIN","",451,"AAG.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":68,"rowKey":"AAG.MC","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG MC","GBX","AAG.MC Co.","XNYS/NYS-MAIN","",346,"AAG.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":69,"rowKey":"AAG.DE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAG DE","GBX","AAG.DE Co.","XNYS/NYS-MAIN","",717,"AAG.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":70,"rowKey":"AAH.L","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH LN","CAD","AAH.L London PLC","XLON/LSE-SETS","",404,"AAH.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":71,"rowKey":"AAH.N","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH US","GBX","AAH.N Corporation","XNGS/NAS-GSM","",606,"AAH.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":72,"rowKey":"AAH.OQ","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH OQ","USD","AAH.OQ Co.","XNYS/NYS-MAIN","",19,"AAH.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":73,"rowKey":"AAH.AS","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH NL","GBX","AAH.AS B.V","XAMS/ENA-MAIN","",429,"AAH.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":74,"rowKey":"AAH.OE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH OE","EUR","AAH.OE Co.","XNYS/NYS-MAIN","",170,"AAH.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":75,"rowKey":"AAH.MI","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH MI","GBX","AAH.MI Co.","XNYS/NYS-MAIN","",234,"AAH.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":76,"rowKey":"AAH.A","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH A","CAD","AAH.A Co.","XNYS/NYS-MAIN","",202,"AAH.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":77,"rowKey":"AAH.PA","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH PA","USD","AAH.PA Co.","XNYS/NYS-MAIN","",426,"AAH.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":78,"rowKey":"AAH.MC","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH MC","EUR","AAH.MC Co.","XNYS/NYS-MAIN","",444,"AAH.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":79,"rowKey":"AAH.DE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAH DE","CAD","AAH.DE Co.","XNYS/NYS-MAIN","",134,"AAH.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":80,"rowKey":"AAI.L","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI LN","GBX","AAI.L London PLC","XLON/LSE-SETS","",517,"AAI.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":81,"rowKey":"AAI.N","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI US","GBX","AAI.N Corporation","XNGS/NAS-GSM","",169,"AAI.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":82,"rowKey":"AAI.OQ","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI OQ","EUR","AAI.OQ Co.","XNYS/NYS-MAIN","",750,"AAI.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":83,"rowKey":"AAI.AS","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI NL","USD","AAI.AS B.V","XAMS/ENA-MAIN","",676,"AAI.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":84,"rowKey":"AAI.OE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI OE","CAD","AAI.OE Co.","XNYS/NYS-MAIN","",823,"AAI.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":85,"rowKey":"AAI.MI","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI MI","EUR","AAI.MI Co.","XNYS/NYS-MAIN","",768,"AAI.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":86,"rowKey":"AAI.A","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI A","EUR","AAI.A Co.","XNYS/NYS-MAIN","",856,"AAI.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":87,"rowKey":"AAI.PA","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI PA","GBX","AAI.PA Co.","XNYS/NYS-MAIN","",120,"AAI.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":88,"rowKey":"AAI.MC","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI MC","USD","AAI.MC Co.","XNYS/NYS-MAIN","",900,"AAI.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":89,"rowKey":"AAI.DE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAI DE","CAD","AAI.DE Co.","XNYS/NYS-MAIN","",48,"AAI.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":90,"rowKey":"AAJ.L","updateType":"U","ts":1639654847955,"sel":0,"data":["AAJ LN","USD","AAJ.L London PLC","XLON/LSE-SETS","",818,"AAJ.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":91,"rowKey":"AAJ.N","updateType":"U","ts":1639654847955,"sel":0,"data":["AAJ US","USD","AAJ.N Corporation","XNGS/NAS-GSM","",581,"AAJ.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":92,"rowKey":"AAJ.OQ","updateType":"U","ts":1639654847955,"sel":0,"data":["AAJ OQ","GBX","AAJ.OQ Co.","XNYS/NYS-MAIN","",761,"AAJ.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":93,"rowKey":"AAJ.AS","updateType":"U","ts":1639654847955,"sel":0,"data":["AAJ NL","CAD","AAJ.AS B.V","XAMS/ENA-MAIN","",435,"AAJ.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":94,"rowKey":"AAJ.OE","updateType":"U","ts":1639654847955,"sel":0,"data":["AAJ OE","EUR","AAJ.OE Co.","XNYS/NYS-MAIN","",407,"AAJ.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":95,"rowKey":"AAJ.MI","updateType":"U","ts":1639654847955,"sel":0,"data":["AAJ MI","GBX","AAJ.MI Co.","XNYS/NYS-MAIN","",269,"AAJ.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":96,"rowKey":"AAJ.A","updateType":"U","ts":1639654847955,"sel":0,"data":["AAJ A","EUR","AAJ.A Co.","XNYS/NYS-MAIN","",774,"AAJ.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":97,"rowKey":"AAJ.PA","updateType":"U","ts":1639654847955,"sel":0,"data":["AAJ PA","USD","AAJ.PA Co.","XNYS/NYS-MAIN","",44,"AAJ.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":98,"rowKey":"AAJ.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAJ MC","EUR","AAJ.MC Co.","XNYS/NYS-MAIN","",828,"AAJ.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":99,"rowKey":"AAJ.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAJ DE","EUR","AAJ.DE Co.","XNYS/NYS-MAIN","",767,"AAJ.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":100,"rowKey":"AAK.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK LN","EUR","AAK.L London PLC","XLON/LSE-SETS","",637,"AAK.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":101,"rowKey":"AAK.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK US","GBX","AAK.N Corporation","XNGS/NAS-GSM","",44,"AAK.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":102,"rowKey":"AAK.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK OQ","USD","AAK.OQ Co.","XNYS/NYS-MAIN","",647,"AAK.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":103,"rowKey":"AAK.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK NL","USD","AAK.AS B.V","XAMS/ENA-MAIN","",312,"AAK.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":104,"rowKey":"AAK.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK OE","GBX","AAK.OE Co.","XNYS/NYS-MAIN","",914,"AAK.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":105,"rowKey":"AAK.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK MI","CAD","AAK.MI Co.","XNYS/NYS-MAIN","",568,"AAK.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":106,"rowKey":"AAK.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK A","EUR","AAK.A Co.","XNYS/NYS-MAIN","",66,"AAK.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":107,"rowKey":"AAK.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK PA","CAD","AAK.PA Co.","XNYS/NYS-MAIN","",325,"AAK.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":108,"rowKey":"AAK.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK MC","EUR","AAK.MC Co.","XNYS/NYS-MAIN","",322,"AAK.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":109,"rowKey":"AAK.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAK DE","USD","AAK.DE Co.","XNYS/NYS-MAIN","",126,"AAK.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":110,"rowKey":"AAL.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL LN","GBX","AAL.L London PLC","XLON/LSE-SETS","",351,"AAL.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":111,"rowKey":"AAL.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL US","CAD","AAL.N Corporation","XNGS/NAS-GSM","",524,"AAL.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":112,"rowKey":"AAL.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL OQ","EUR","AAL.OQ Co.","XNYS/NYS-MAIN","",686,"AAL.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":113,"rowKey":"AAL.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL NL","CAD","AAL.AS B.V","XAMS/ENA-MAIN","",751,"AAL.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":114,"rowKey":"AAL.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL OE","CAD","AAL.OE Co.","XNYS/NYS-MAIN","",283,"AAL.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":115,"rowKey":"AAL.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL MI","CAD","AAL.MI Co.","XNYS/NYS-MAIN","",888,"AAL.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":116,"rowKey":"AAL.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL A","EUR","AAL.A Co.","XNYS/NYS-MAIN","",895,"AAL.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":117,"rowKey":"AAL.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL PA","USD","AAL.PA Co.","XNYS/NYS-MAIN","",107,"AAL.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":118,"rowKey":"AAL.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL MC","GBX","AAL.MC Co.","XNYS/NYS-MAIN","",269,"AAL.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":119,"rowKey":"AAL.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAL DE","GBX","AAL.DE Co.","XNYS/NYS-MAIN","",308,"AAL.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":120,"rowKey":"AAM.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM LN","EUR","AAM.L London PLC","XLON/LSE-SETS","",137,"AAM.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":121,"rowKey":"AAM.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM US","GBX","AAM.N Corporation","XNGS/NAS-GSM","",730,"AAM.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":122,"rowKey":"AAM.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM OQ","USD","AAM.OQ Co.","XNYS/NYS-MAIN","",509,"AAM.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":123,"rowKey":"AAM.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM NL","USD","AAM.AS B.V","XAMS/ENA-MAIN","",852,"AAM.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":124,"rowKey":"AAM.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM OE","EUR","AAM.OE Co.","XNYS/NYS-MAIN","",50,"AAM.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":125,"rowKey":"AAM.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM MI","CAD","AAM.MI Co.","XNYS/NYS-MAIN","",943,"AAM.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":126,"rowKey":"AAM.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM A","GBX","AAM.A Co.","XNYS/NYS-MAIN","",95,"AAM.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":127,"rowKey":"AAM.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM PA","GBX","AAM.PA Co.","XNYS/NYS-MAIN","",937,"AAM.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":128,"rowKey":"AAM.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM MC","USD","AAM.MC Co.","XNYS/NYS-MAIN","",377,"AAM.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":129,"rowKey":"AAM.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAM DE","GBX","AAM.DE Co.","XNYS/NYS-MAIN","",917,"AAM.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":130,"rowKey":"AAN.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN LN","EUR","AAN.L London PLC","XLON/LSE-SETS","",703,"AAN.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":131,"rowKey":"AAN.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN US","CAD","AAN.N Corporation","XNGS/NAS-GSM","",243,"AAN.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":132,"rowKey":"AAN.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN OQ","USD","AAN.OQ Co.","XNYS/NYS-MAIN","",785,"AAN.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":133,"rowKey":"AAN.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN NL","USD","AAN.AS B.V","XAMS/ENA-MAIN","",443,"AAN.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":134,"rowKey":"AAN.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN OE","USD","AAN.OE Co.","XNYS/NYS-MAIN","",693,"AAN.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":135,"rowKey":"AAN.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN MI","GBX","AAN.MI Co.","XNYS/NYS-MAIN","",102,"AAN.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":136,"rowKey":"AAN.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN A","EUR","AAN.A Co.","XNYS/NYS-MAIN","",965,"AAN.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":137,"rowKey":"AAN.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN PA","EUR","AAN.PA Co.","XNYS/NYS-MAIN","",34,"AAN.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":138,"rowKey":"AAN.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN MC","USD","AAN.MC Co.","XNYS/NYS-MAIN","",184,"AAN.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":139,"rowKey":"AAN.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAN DE","EUR","AAN.DE Co.","XNYS/NYS-MAIN","",296,"AAN.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":140,"rowKey":"AAO.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO LN","GBX","AAO.L London PLC","XLON/LSE-SETS","",435,"AAO.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":141,"rowKey":"AAO.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO US","GBX","AAO.N Corporation","XNGS/NAS-GSM","",403,"AAO.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":142,"rowKey":"AAO.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO OQ","GBX","AAO.OQ Co.","XNYS/NYS-MAIN","",524,"AAO.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":143,"rowKey":"AAO.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO NL","CAD","AAO.AS B.V","XAMS/ENA-MAIN","",750,"AAO.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":144,"rowKey":"AAO.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO OE","EUR","AAO.OE Co.","XNYS/NYS-MAIN","",691,"AAO.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":145,"rowKey":"AAO.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO MI","CAD","AAO.MI Co.","XNYS/NYS-MAIN","",659,"AAO.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":146,"rowKey":"AAO.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO A","EUR","AAO.A Co.","XNYS/NYS-MAIN","",870,"AAO.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":147,"rowKey":"AAO.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO PA","CAD","AAO.PA Co.","XNYS/NYS-MAIN","",380,"AAO.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":148,"rowKey":"AAO.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO MC","USD","AAO.MC Co.","XNYS/NYS-MAIN","",927,"AAO.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":149,"rowKey":"AAO.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAO DE","GBX","AAO.DE Co.","XNYS/NYS-MAIN","",920,"AAO.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":150,"rowKey":"AAP.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP LN","USD","AAP.L London PLC","XLON/LSE-SETS","",580,"AAP.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":151,"rowKey":"AAP.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP US","EUR","AAP.N Corporation","XNGS/NAS-GSM","",684,"AAP.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":152,"rowKey":"AAP.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP OQ","USD","AAP.OQ Co.","XNYS/NYS-MAIN","",642,"AAP.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":153,"rowKey":"AAP.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP NL","USD","AAP.AS B.V","XAMS/ENA-MAIN","",730,"AAP.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":154,"rowKey":"AAP.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP OE","EUR","AAP.OE Co.","XNYS/NYS-MAIN","",455,"AAP.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":155,"rowKey":"AAP.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP MI","CAD","AAP.MI Co.","XNYS/NYS-MAIN","",563,"AAP.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":156,"rowKey":"AAP.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP A","EUR","AAP.A Co.","XNYS/NYS-MAIN","",291,"AAP.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":157,"rowKey":"AAP.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP PA","USD","AAP.PA Co.","XNYS/NYS-MAIN","",981,"AAP.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":158,"rowKey":"AAP.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP MC","CAD","AAP.MC Co.","XNYS/NYS-MAIN","",394,"AAP.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":159,"rowKey":"AAP.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAP DE","GBX","AAP.DE Co.","XNYS/NYS-MAIN","",17,"AAP.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":160,"rowKey":"AAQ.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ LN","GBX","AAQ.L London PLC","XLON/LSE-SETS","",529,"AAQ.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":161,"rowKey":"AAQ.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ US","EUR","AAQ.N Corporation","XNGS/NAS-GSM","",99,"AAQ.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":162,"rowKey":"AAQ.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ OQ","USD","AAQ.OQ Co.","XNYS/NYS-MAIN","",298,"AAQ.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":163,"rowKey":"AAQ.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ NL","USD","AAQ.AS B.V","XAMS/ENA-MAIN","",695,"AAQ.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":164,"rowKey":"AAQ.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ OE","USD","AAQ.OE Co.","XNYS/NYS-MAIN","",341,"AAQ.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":165,"rowKey":"AAQ.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ MI","CAD","AAQ.MI Co.","XNYS/NYS-MAIN","",141,"AAQ.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":166,"rowKey":"AAQ.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ A","CAD","AAQ.A Co.","XNYS/NYS-MAIN","",557,"AAQ.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":167,"rowKey":"AAQ.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ PA","USD","AAQ.PA Co.","XNYS/NYS-MAIN","",928,"AAQ.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":168,"rowKey":"AAQ.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ MC","CAD","AAQ.MC Co.","XNYS/NYS-MAIN","",981,"AAQ.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":169,"rowKey":"AAQ.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAQ DE","CAD","AAQ.DE Co.","XNYS/NYS-MAIN","",448,"AAQ.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":170,"rowKey":"AAR.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR LN","USD","AAR.L London PLC","XLON/LSE-SETS","",565,"AAR.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":171,"rowKey":"AAR.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR US","GBX","AAR.N Corporation","XNGS/NAS-GSM","",58,"AAR.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":172,"rowKey":"AAR.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR OQ","USD","AAR.OQ Co.","XNYS/NYS-MAIN","",861,"AAR.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":173,"rowKey":"AAR.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR NL","USD","AAR.AS B.V","XAMS/ENA-MAIN","",393,"AAR.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":174,"rowKey":"AAR.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR OE","GBX","AAR.OE Co.","XNYS/NYS-MAIN","",900,"AAR.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":175,"rowKey":"AAR.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR MI","EUR","AAR.MI Co.","XNYS/NYS-MAIN","",180,"AAR.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":176,"rowKey":"AAR.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR A","CAD","AAR.A Co.","XNYS/NYS-MAIN","",101,"AAR.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":177,"rowKey":"AAR.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR PA","EUR","AAR.PA Co.","XNYS/NYS-MAIN","",916,"AAR.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":178,"rowKey":"AAR.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR MC","CAD","AAR.MC Co.","XNYS/NYS-MAIN","",415,"AAR.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":179,"rowKey":"AAR.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAR DE","GBX","AAR.DE Co.","XNYS/NYS-MAIN","",887,"AAR.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":180,"rowKey":"AAS.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS LN","GBX","AAS.L London PLC","XLON/LSE-SETS","",856,"AAS.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":181,"rowKey":"AAS.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS US","CAD","AAS.N Corporation","XNGS/NAS-GSM","",638,"AAS.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":182,"rowKey":"AAS.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS OQ","EUR","AAS.OQ Co.","XNYS/NYS-MAIN","",821,"AAS.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":183,"rowKey":"AAS.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS NL","CAD","AAS.AS B.V","XAMS/ENA-MAIN","",783,"AAS.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":184,"rowKey":"AAS.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS OE","EUR","AAS.OE Co.","XNYS/NYS-MAIN","",80,"AAS.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":185,"rowKey":"AAS.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS MI","CAD","AAS.MI Co.","XNYS/NYS-MAIN","",456,"AAS.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":186,"rowKey":"AAS.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS A","EUR","AAS.A Co.","XNYS/NYS-MAIN","",295,"AAS.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":187,"rowKey":"AAS.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS PA","GBX","AAS.PA Co.","XNYS/NYS-MAIN","",857,"AAS.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":188,"rowKey":"AAS.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS MC","CAD","AAS.MC Co.","XNYS/NYS-MAIN","",621,"AAS.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":189,"rowKey":"AAS.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAS DE","USD","AAS.DE Co.","XNYS/NYS-MAIN","",260,"AAS.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":190,"rowKey":"AAT.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT LN","USD","AAT.L London PLC","XLON/LSE-SETS","",759,"AAT.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":191,"rowKey":"AAT.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT US","USD","AAT.N Corporation","XNGS/NAS-GSM","",380,"AAT.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":192,"rowKey":"AAT.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT OQ","EUR","AAT.OQ Co.","XNYS/NYS-MAIN","",525,"AAT.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":193,"rowKey":"AAT.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT NL","EUR","AAT.AS B.V","XAMS/ENA-MAIN","",543,"AAT.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":194,"rowKey":"AAT.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT OE","USD","AAT.OE Co.","XNYS/NYS-MAIN","",290,"AAT.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":195,"rowKey":"AAT.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT MI","GBX","AAT.MI Co.","XNYS/NYS-MAIN","",842,"AAT.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":196,"rowKey":"AAT.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT A","GBX","AAT.A Co.","XNYS/NYS-MAIN","",298,"AAT.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":197,"rowKey":"AAT.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT PA","USD","AAT.PA Co.","XNYS/NYS-MAIN","",583,"AAT.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":198,"rowKey":"AAT.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT MC","CAD","AAT.MC Co.","XNYS/NYS-MAIN","",216,"AAT.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":199,"rowKey":"AAT.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAT DE","GBX","AAT.DE Co.","XNYS/NYS-MAIN","",453,"AAT.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":200,"rowKey":"AAU.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU LN","EUR","AAU.L London PLC","XLON/LSE-SETS","",481,"AAU.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":201,"rowKey":"AAU.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU US","CAD","AAU.N Corporation","XNGS/NAS-GSM","",277,"AAU.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":202,"rowKey":"AAU.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU OQ","GBX","AAU.OQ Co.","XNYS/NYS-MAIN","",984,"AAU.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":203,"rowKey":"AAU.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU NL","CAD","AAU.AS B.V","XAMS/ENA-MAIN","",812,"AAU.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":204,"rowKey":"AAU.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU OE","EUR","AAU.OE Co.","XNYS/NYS-MAIN","",439,"AAU.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":205,"rowKey":"AAU.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU MI","EUR","AAU.MI Co.","XNYS/NYS-MAIN","",810,"AAU.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":206,"rowKey":"AAU.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU A","USD","AAU.A Co.","XNYS/NYS-MAIN","",455,"AAU.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":207,"rowKey":"AAU.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU PA","EUR","AAU.PA Co.","XNYS/NYS-MAIN","",853,"AAU.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":208,"rowKey":"AAU.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU MC","GBX","AAU.MC Co.","XNYS/NYS-MAIN","",980,"AAU.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":209,"rowKey":"AAU.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAU DE","EUR","AAU.DE Co.","XNYS/NYS-MAIN","",651,"AAU.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":210,"rowKey":"AAV.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV LN","CAD","AAV.L London PLC","XLON/LSE-SETS","",807,"AAV.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":211,"rowKey":"AAV.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV US","GBX","AAV.N Corporation","XNGS/NAS-GSM","",642,"AAV.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":212,"rowKey":"AAV.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV OQ","EUR","AAV.OQ Co.","XNYS/NYS-MAIN","",425,"AAV.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":213,"rowKey":"AAV.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV NL","USD","AAV.AS B.V","XAMS/ENA-MAIN","",174,"AAV.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":214,"rowKey":"AAV.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV OE","GBX","AAV.OE Co.","XNYS/NYS-MAIN","",41,"AAV.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":215,"rowKey":"AAV.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV MI","CAD","AAV.MI Co.","XNYS/NYS-MAIN","",998,"AAV.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":216,"rowKey":"AAV.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV A","GBX","AAV.A Co.","XNYS/NYS-MAIN","",555,"AAV.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":217,"rowKey":"AAV.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV PA","GBX","AAV.PA Co.","XNYS/NYS-MAIN","",763,"AAV.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":218,"rowKey":"AAV.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV MC","EUR","AAV.MC Co.","XNYS/NYS-MAIN","",30,"AAV.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":219,"rowKey":"AAV.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAV DE","EUR","AAV.DE Co.","XNYS/NYS-MAIN","",223,"AAV.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":220,"rowKey":"AAW.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW LN","USD","AAW.L London PLC","XLON/LSE-SETS","",199,"AAW.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":221,"rowKey":"AAW.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW US","USD","AAW.N Corporation","XNGS/NAS-GSM","",205,"AAW.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":222,"rowKey":"AAW.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW OQ","CAD","AAW.OQ Co.","XNYS/NYS-MAIN","",239,"AAW.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":223,"rowKey":"AAW.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW NL","GBX","AAW.AS B.V","XAMS/ENA-MAIN","",771,"AAW.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":224,"rowKey":"AAW.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW OE","USD","AAW.OE Co.","XNYS/NYS-MAIN","",854,"AAW.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":225,"rowKey":"AAW.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW MI","GBX","AAW.MI Co.","XNYS/NYS-MAIN","",737,"AAW.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":226,"rowKey":"AAW.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW A","GBX","AAW.A Co.","XNYS/NYS-MAIN","",466,"AAW.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":227,"rowKey":"AAW.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW PA","GBX","AAW.PA Co.","XNYS/NYS-MAIN","",421,"AAW.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":228,"rowKey":"AAW.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW MC","EUR","AAW.MC Co.","XNYS/NYS-MAIN","",520,"AAW.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":229,"rowKey":"AAW.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAW DE","EUR","AAW.DE Co.","XNYS/NYS-MAIN","",124,"AAW.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":230,"rowKey":"AAX.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX LN","CAD","AAX.L London PLC","XLON/LSE-SETS","",414,"AAX.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":231,"rowKey":"AAX.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX US","EUR","AAX.N Corporation","XNGS/NAS-GSM","",398,"AAX.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":232,"rowKey":"AAX.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX OQ","GBX","AAX.OQ Co.","XNYS/NYS-MAIN","",442,"AAX.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":233,"rowKey":"AAX.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX NL","EUR","AAX.AS B.V","XAMS/ENA-MAIN","",335,"AAX.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":234,"rowKey":"AAX.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX OE","GBX","AAX.OE Co.","XNYS/NYS-MAIN","",787,"AAX.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":235,"rowKey":"AAX.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX MI","USD","AAX.MI Co.","XNYS/NYS-MAIN","",326,"AAX.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":236,"rowKey":"AAX.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX A","CAD","AAX.A Co.","XNYS/NYS-MAIN","",418,"AAX.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":237,"rowKey":"AAX.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX PA","GBX","AAX.PA Co.","XNYS/NYS-MAIN","",732,"AAX.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":238,"rowKey":"AAX.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX MC","CAD","AAX.MC Co.","XNYS/NYS-MAIN","",300,"AAX.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":239,"rowKey":"AAX.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAX DE","EUR","AAX.DE Co.","XNYS/NYS-MAIN","",50,"AAX.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":240,"rowKey":"AAY.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY LN","EUR","AAY.L London PLC","XLON/LSE-SETS","",511,"AAY.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":241,"rowKey":"AAY.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY US","USD","AAY.N Corporation","XNGS/NAS-GSM","",239,"AAY.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":242,"rowKey":"AAY.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY OQ","CAD","AAY.OQ Co.","XNYS/NYS-MAIN","",94,"AAY.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":243,"rowKey":"AAY.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY NL","GBX","AAY.AS B.V","XAMS/ENA-MAIN","",581,"AAY.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":244,"rowKey":"AAY.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY OE","USD","AAY.OE Co.","XNYS/NYS-MAIN","",251,"AAY.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":245,"rowKey":"AAY.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY MI","CAD","AAY.MI Co.","XNYS/NYS-MAIN","",471,"AAY.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":246,"rowKey":"AAY.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY A","CAD","AAY.A Co.","XNYS/NYS-MAIN","",336,"AAY.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":247,"rowKey":"AAY.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY PA","GBX","AAY.PA Co.","XNYS/NYS-MAIN","",89,"AAY.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":248,"rowKey":"AAY.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY MC","USD","AAY.MC Co.","XNYS/NYS-MAIN","",170,"AAY.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":249,"rowKey":"AAY.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAY DE","GBX","AAY.DE Co.","XNYS/NYS-MAIN","",804,"AAY.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":250,"rowKey":"AAZ.L","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ LN","CAD","AAZ.L London PLC","XLON/LSE-SETS","",667,"AAZ.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":251,"rowKey":"AAZ.N","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ US","USD","AAZ.N Corporation","XNGS/NAS-GSM","",757,"AAZ.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":252,"rowKey":"AAZ.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ OQ","USD","AAZ.OQ Co.","XNYS/NYS-MAIN","",211,"AAZ.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":253,"rowKey":"AAZ.AS","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ NL","GBX","AAZ.AS B.V","XAMS/ENA-MAIN","",784,"AAZ.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":254,"rowKey":"AAZ.OE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ OE","EUR","AAZ.OE Co.","XNYS/NYS-MAIN","",793,"AAZ.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":255,"rowKey":"AAZ.MI","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ MI","GBX","AAZ.MI Co.","XNYS/NYS-MAIN","",950,"AAZ.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":256,"rowKey":"AAZ.A","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ A","GBX","AAZ.A Co.","XNYS/NYS-MAIN","",691,"AAZ.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":257,"rowKey":"AAZ.PA","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ PA","CAD","AAZ.PA Co.","XNYS/NYS-MAIN","",0,"AAZ.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":258,"rowKey":"AAZ.MC","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ MC","GBX","AAZ.MC Co.","XNYS/NYS-MAIN","",648,"AAZ.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":259,"rowKey":"AAZ.DE","updateType":"U","ts":1639654847956,"sel":0,"data":["AAZ DE","EUR","AAZ.DE Co.","XNYS/NYS-MAIN","",263,"AAZ.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":260,"rowKey":"ABA.L","updateType":"U","ts":1639654847956,"sel":0,"data":["ABA LN","GBX","ABA.L London PLC","XLON/LSE-SETS","",86,"ABA.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":261,"rowKey":"ABA.N","updateType":"U","ts":1639654847956,"sel":0,"data":["ABA US","USD","ABA.N Corporation","XNGS/NAS-GSM","",498,"ABA.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":262,"rowKey":"ABA.OQ","updateType":"U","ts":1639654847956,"sel":0,"data":["ABA OQ","USD","ABA.OQ Co.","XNYS/NYS-MAIN","",214,"ABA.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":263,"rowKey":"ABA.AS","updateType":"U","ts":1639654847957,"sel":0,"data":["ABA NL","USD","ABA.AS B.V","XAMS/ENA-MAIN","",443,"ABA.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":264,"rowKey":"ABA.OE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABA OE","CAD","ABA.OE Co.","XNYS/NYS-MAIN","",728,"ABA.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":265,"rowKey":"ABA.MI","updateType":"U","ts":1639654847957,"sel":0,"data":["ABA MI","GBX","ABA.MI Co.","XNYS/NYS-MAIN","",958,"ABA.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":266,"rowKey":"ABA.A","updateType":"U","ts":1639654847957,"sel":0,"data":["ABA A","EUR","ABA.A Co.","XNYS/NYS-MAIN","",811,"ABA.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":267,"rowKey":"ABA.PA","updateType":"U","ts":1639654847957,"sel":0,"data":["ABA PA","EUR","ABA.PA Co.","XNYS/NYS-MAIN","",127,"ABA.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":268,"rowKey":"ABA.MC","updateType":"U","ts":1639654847957,"sel":0,"data":["ABA MC","EUR","ABA.MC Co.","XNYS/NYS-MAIN","",493,"ABA.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":269,"rowKey":"ABA.DE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABA DE","EUR","ABA.DE Co.","XNYS/NYS-MAIN","",719,"ABA.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":270,"rowKey":"ABB.L","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB LN","USD","ABB.L London PLC","XLON/LSE-SETS","",284,"ABB.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":271,"rowKey":"ABB.N","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB US","USD","ABB.N Corporation","XNGS/NAS-GSM","",419,"ABB.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":272,"rowKey":"ABB.OQ","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB OQ","CAD","ABB.OQ Co.","XNYS/NYS-MAIN","",183,"ABB.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":273,"rowKey":"ABB.AS","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB NL","USD","ABB.AS B.V","XAMS/ENA-MAIN","",769,"ABB.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":274,"rowKey":"ABB.OE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB OE","CAD","ABB.OE Co.","XNYS/NYS-MAIN","",996,"ABB.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":275,"rowKey":"ABB.MI","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB MI","USD","ABB.MI Co.","XNYS/NYS-MAIN","",239,"ABB.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":276,"rowKey":"ABB.A","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB A","CAD","ABB.A Co.","XNYS/NYS-MAIN","",910,"ABB.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":277,"rowKey":"ABB.PA","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB PA","EUR","ABB.PA Co.","XNYS/NYS-MAIN","",82,"ABB.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":278,"rowKey":"ABB.MC","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB MC","CAD","ABB.MC Co.","XNYS/NYS-MAIN","",906,"ABB.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":279,"rowKey":"ABB.DE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABB DE","GBX","ABB.DE Co.","XNYS/NYS-MAIN","",536,"ABB.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":280,"rowKey":"ABC.L","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC LN","USD","ABC.L London PLC","XLON/LSE-SETS","",206,"ABC.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":281,"rowKey":"ABC.N","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC US","EUR","ABC.N Corporation","XNGS/NAS-GSM","",362,"ABC.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":282,"rowKey":"ABC.OQ","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC OQ","CAD","ABC.OQ Co.","XNYS/NYS-MAIN","",895,"ABC.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":283,"rowKey":"ABC.AS","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC NL","EUR","ABC.AS B.V","XAMS/ENA-MAIN","",282,"ABC.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":284,"rowKey":"ABC.OE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC OE","CAD","ABC.OE Co.","XNYS/NYS-MAIN","",942,"ABC.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":285,"rowKey":"ABC.MI","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC MI","CAD","ABC.MI Co.","XNYS/NYS-MAIN","",733,"ABC.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":286,"rowKey":"ABC.A","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC A","CAD","ABC.A Co.","XNYS/NYS-MAIN","",639,"ABC.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":287,"rowKey":"ABC.PA","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC PA","GBX","ABC.PA Co.","XNYS/NYS-MAIN","",452,"ABC.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":288,"rowKey":"ABC.MC","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC MC","USD","ABC.MC Co.","XNYS/NYS-MAIN","",125,"ABC.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":289,"rowKey":"ABC.DE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABC DE","EUR","ABC.DE Co.","XNYS/NYS-MAIN","",709,"ABC.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":290,"rowKey":"ABD.L","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD LN","EUR","ABD.L London PLC","XLON/LSE-SETS","",661,"ABD.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":291,"rowKey":"ABD.N","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD US","GBX","ABD.N Corporation","XNGS/NAS-GSM","",233,"ABD.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":292,"rowKey":"ABD.OQ","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD OQ","GBX","ABD.OQ Co.","XNYS/NYS-MAIN","",661,"ABD.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":293,"rowKey":"ABD.AS","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD NL","EUR","ABD.AS B.V","XAMS/ENA-MAIN","",922,"ABD.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":294,"rowKey":"ABD.OE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD OE","EUR","ABD.OE Co.","XNYS/NYS-MAIN","",745,"ABD.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":295,"rowKey":"ABD.MI","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD MI","EUR","ABD.MI Co.","XNYS/NYS-MAIN","",155,"ABD.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":296,"rowKey":"ABD.A","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD A","GBX","ABD.A Co.","XNYS/NYS-MAIN","",954,"ABD.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":297,"rowKey":"ABD.PA","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD PA","GBX","ABD.PA Co.","XNYS/NYS-MAIN","",44,"ABD.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":298,"rowKey":"ABD.MC","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD MC","GBX","ABD.MC Co.","XNYS/NYS-MAIN","",51,"ABD.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":299,"rowKey":"ABD.DE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABD DE","USD","ABD.DE Co.","XNYS/NYS-MAIN","",312,"ABD.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":300,"rowKey":"ABE.L","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE LN","USD","ABE.L London PLC","XLON/LSE-SETS","",650,"ABE.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":301,"rowKey":"ABE.N","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE US","EUR","ABE.N Corporation","XNGS/NAS-GSM","",316,"ABE.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":302,"rowKey":"ABE.OQ","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE OQ","CAD","ABE.OQ Co.","XNYS/NYS-MAIN","",910,"ABE.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":303,"rowKey":"ABE.AS","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE NL","EUR","ABE.AS B.V","XAMS/ENA-MAIN","",551,"ABE.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":304,"rowKey":"ABE.OE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE OE","CAD","ABE.OE Co.","XNYS/NYS-MAIN","",587,"ABE.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":305,"rowKey":"ABE.MI","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE MI","EUR","ABE.MI Co.","XNYS/NYS-MAIN","",65,"ABE.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":306,"rowKey":"ABE.A","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE A","CAD","ABE.A Co.","XNYS/NYS-MAIN","",848,"ABE.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":307,"rowKey":"ABE.PA","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE PA","EUR","ABE.PA Co.","XNYS/NYS-MAIN","",785,"ABE.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":308,"rowKey":"ABE.MC","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE MC","USD","ABE.MC Co.","XNYS/NYS-MAIN","",121,"ABE.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":309,"rowKey":"ABE.DE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABE DE","USD","ABE.DE Co.","XNYS/NYS-MAIN","",135,"ABE.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":310,"rowKey":"ABF.L","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF LN","EUR","ABF.L London PLC","XLON/LSE-SETS","",798,"ABF.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":311,"rowKey":"ABF.N","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF US","CAD","ABF.N Corporation","XNGS/NAS-GSM","",42,"ABF.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":312,"rowKey":"ABF.OQ","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF OQ","CAD","ABF.OQ Co.","XNYS/NYS-MAIN","",855,"ABF.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":313,"rowKey":"ABF.AS","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF NL","EUR","ABF.AS B.V","XAMS/ENA-MAIN","",990,"ABF.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":314,"rowKey":"ABF.OE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF OE","CAD","ABF.OE Co.","XNYS/NYS-MAIN","",906,"ABF.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":315,"rowKey":"ABF.MI","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF MI","USD","ABF.MI Co.","XNYS/NYS-MAIN","",142,"ABF.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":316,"rowKey":"ABF.A","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF A","GBX","ABF.A Co.","XNYS/NYS-MAIN","",315,"ABF.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":317,"rowKey":"ABF.PA","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF PA","USD","ABF.PA Co.","XNYS/NYS-MAIN","",211,"ABF.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":318,"rowKey":"ABF.MC","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF MC","USD","ABF.MC Co.","XNYS/NYS-MAIN","",742,"ABF.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":319,"rowKey":"ABF.DE","updateType":"U","ts":1639654847957,"sel":0,"data":["ABF DE","USD","ABF.DE Co.","XNYS/NYS-MAIN","",910,"ABF.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":320,"rowKey":"ABG.L","updateType":"U","ts":1639654847957,"sel":0,"data":["ABG LN","CAD","ABG.L London PLC","XLON/LSE-SETS","",828,"ABG.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":321,"rowKey":"ABG.N","updateType":"U","ts":1639654847957,"sel":0,"data":["ABG US","GBX","ABG.N Corporation","XNGS/NAS-GSM","",360,"ABG.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":322,"rowKey":"ABG.OQ","updateType":"U","ts":1639654847957,"sel":0,"data":["ABG OQ","EUR","ABG.OQ Co.","XNYS/NYS-MAIN","",256,"ABG.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":323,"rowKey":"ABG.AS","updateType":"U","ts":1639654847957,"sel":0,"data":["ABG NL","USD","ABG.AS B.V","XAMS/ENA-MAIN","",779,"ABG.AS"]}]},"module":"CORE"}
11:40:47.975   ASYNC-SVR-OUT:{"requestId":"NA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"","user":"user","body":{"type":"TABLE_ROW","batch":"80c34390-0c40-448a-8f94-e3c548064ac7","isLast":true,"timeStamp":1639654847972,"rows":[{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":324,"rowKey":"ABG.OE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABG OE","CAD","ABG.OE Co.","XNYS/NYS-MAIN","",661,"ABG.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":325,"rowKey":"ABG.MI","updateType":"U","ts":1639654847971,"sel":0,"data":["ABG MI","CAD","ABG.MI Co.","XNYS/NYS-MAIN","",563,"ABG.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":326,"rowKey":"ABG.A","updateType":"U","ts":1639654847971,"sel":0,"data":["ABG A","GBX","ABG.A Co.","XNYS/NYS-MAIN","",926,"ABG.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":327,"rowKey":"ABG.PA","updateType":"U","ts":1639654847971,"sel":0,"data":["ABG PA","USD","ABG.PA Co.","XNYS/NYS-MAIN","",775,"ABG.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":328,"rowKey":"ABG.MC","updateType":"U","ts":1639654847971,"sel":0,"data":["ABG MC","EUR","ABG.MC Co.","XNYS/NYS-MAIN","",857,"ABG.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":329,"rowKey":"ABG.DE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABG DE","CAD","ABG.DE Co.","XNYS/NYS-MAIN","",519,"ABG.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":330,"rowKey":"ABH.L","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH LN","EUR","ABH.L London PLC","XLON/LSE-SETS","",401,"ABH.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":331,"rowKey":"ABH.N","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH US","GBX","ABH.N Corporation","XNGS/NAS-GSM","",153,"ABH.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":332,"rowKey":"ABH.OQ","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH OQ","GBX","ABH.OQ Co.","XNYS/NYS-MAIN","",190,"ABH.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":333,"rowKey":"ABH.AS","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH NL","EUR","ABH.AS B.V","XAMS/ENA-MAIN","",283,"ABH.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":334,"rowKey":"ABH.OE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH OE","CAD","ABH.OE Co.","XNYS/NYS-MAIN","",875,"ABH.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":335,"rowKey":"ABH.MI","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH MI","CAD","ABH.MI Co.","XNYS/NYS-MAIN","",343,"ABH.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":336,"rowKey":"ABH.A","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH A","GBX","ABH.A Co.","XNYS/NYS-MAIN","",428,"ABH.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":337,"rowKey":"ABH.PA","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH PA","EUR","ABH.PA Co.","XNYS/NYS-MAIN","",510,"ABH.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":338,"rowKey":"ABH.MC","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH MC","GBX","ABH.MC Co.","XNYS/NYS-MAIN","",106,"ABH.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":339,"rowKey":"ABH.DE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABH DE","USD","ABH.DE Co.","XNYS/NYS-MAIN","",386,"ABH.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":340,"rowKey":"ABI.L","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI LN","GBX","ABI.L London PLC","XLON/LSE-SETS","",253,"ABI.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":341,"rowKey":"ABI.N","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI US","GBX","ABI.N Corporation","XNGS/NAS-GSM","",85,"ABI.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":342,"rowKey":"ABI.OQ","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI OQ","USD","ABI.OQ Co.","XNYS/NYS-MAIN","",141,"ABI.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":343,"rowKey":"ABI.AS","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI NL","GBX","ABI.AS B.V","XAMS/ENA-MAIN","",543,"ABI.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":344,"rowKey":"ABI.OE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI OE","EUR","ABI.OE Co.","XNYS/NYS-MAIN","",628,"ABI.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":345,"rowKey":"ABI.MI","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI MI","CAD","ABI.MI Co.","XNYS/NYS-MAIN","",408,"ABI.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":346,"rowKey":"ABI.A","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI A","USD","ABI.A Co.","XNYS/NYS-MAIN","",243,"ABI.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":347,"rowKey":"ABI.PA","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI PA","CAD","ABI.PA Co.","XNYS/NYS-MAIN","",91,"ABI.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":348,"rowKey":"ABI.MC","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI MC","CAD","ABI.MC Co.","XNYS/NYS-MAIN","",728,"ABI.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":349,"rowKey":"ABI.DE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABI DE","EUR","ABI.DE Co.","XNYS/NYS-MAIN","",202,"ABI.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":350,"rowKey":"ABJ.L","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ LN","EUR","ABJ.L London PLC","XLON/LSE-SETS","",233,"ABJ.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":351,"rowKey":"ABJ.N","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ US","EUR","ABJ.N Corporation","XNGS/NAS-GSM","",524,"ABJ.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":352,"rowKey":"ABJ.OQ","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ OQ","EUR","ABJ.OQ Co.","XNYS/NYS-MAIN","",400,"ABJ.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":353,"rowKey":"ABJ.AS","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ NL","EUR","ABJ.AS B.V","XAMS/ENA-MAIN","",136,"ABJ.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":354,"rowKey":"ABJ.OE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ OE","EUR","ABJ.OE Co.","XNYS/NYS-MAIN","",434,"ABJ.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":355,"rowKey":"ABJ.MI","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ MI","EUR","ABJ.MI Co.","XNYS/NYS-MAIN","",396,"ABJ.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":356,"rowKey":"ABJ.A","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ A","GBX","ABJ.A Co.","XNYS/NYS-MAIN","",741,"ABJ.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":357,"rowKey":"ABJ.PA","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ PA","CAD","ABJ.PA Co.","XNYS/NYS-MAIN","",759,"ABJ.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":358,"rowKey":"ABJ.MC","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ MC","USD","ABJ.MC Co.","XNYS/NYS-MAIN","",574,"ABJ.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":359,"rowKey":"ABJ.DE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABJ DE","GBX","ABJ.DE Co.","XNYS/NYS-MAIN","",855,"ABJ.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":360,"rowKey":"ABK.L","updateType":"U","ts":1639654847971,"sel":0,"data":["ABK LN","CAD","ABK.L London PLC","XLON/LSE-SETS","",221,"ABK.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":361,"rowKey":"ABK.N","updateType":"U","ts":1639654847971,"sel":0,"data":["ABK US","GBX","ABK.N Corporation","XNGS/NAS-GSM","",783,"ABK.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":362,"rowKey":"ABK.OQ","updateType":"U","ts":1639654847971,"sel":0,"data":["ABK OQ","CAD","ABK.OQ Co.","XNYS/NYS-MAIN","",789,"ABK.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":363,"rowKey":"ABK.AS","updateType":"U","ts":1639654847971,"sel":0,"data":["ABK NL","USD","ABK.AS B.V","XAMS/ENA-MAIN","",785,"ABK.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":364,"rowKey":"ABK.OE","updateType":"U","ts":1639654847971,"sel":0,"data":["ABK OE","GBX","ABK.OE Co.","XNYS/NYS-MAIN","",404,"ABK.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":365,"rowKey":"ABK.MI","updateType":"U","ts":1639654847971,"sel":0,"data":["ABK MI","USD","ABK.MI Co.","XNYS/NYS-MAIN","",684,"ABK.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":366,"rowKey":"ABK.A","updateType":"U","ts":1639654847972,"sel":0,"data":["ABK A","EUR","ABK.A Co.","XNYS/NYS-MAIN","",51,"ABK.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":367,"rowKey":"ABK.PA","updateType":"U","ts":1639654847972,"sel":0,"data":["ABK PA","CAD","ABK.PA Co.","XNYS/NYS-MAIN","",154,"ABK.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":368,"rowKey":"ABK.MC","updateType":"U","ts":1639654847972,"sel":0,"data":["ABK MC","EUR","ABK.MC Co.","XNYS/NYS-MAIN","",386,"ABK.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":369,"rowKey":"ABK.DE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABK DE","CAD","ABK.DE Co.","XNYS/NYS-MAIN","",65,"ABK.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":370,"rowKey":"ABL.L","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL LN","CAD","ABL.L London PLC","XLON/LSE-SETS","",4,"ABL.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":371,"rowKey":"ABL.N","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL US","GBX","ABL.N Corporation","XNGS/NAS-GSM","",772,"ABL.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":372,"rowKey":"ABL.OQ","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL OQ","CAD","ABL.OQ Co.","XNYS/NYS-MAIN","",202,"ABL.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":373,"rowKey":"ABL.AS","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL NL","GBX","ABL.AS B.V","XAMS/ENA-MAIN","",621,"ABL.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":374,"rowKey":"ABL.OE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL OE","GBX","ABL.OE Co.","XNYS/NYS-MAIN","",526,"ABL.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":375,"rowKey":"ABL.MI","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL MI","GBX","ABL.MI Co.","XNYS/NYS-MAIN","",537,"ABL.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":376,"rowKey":"ABL.A","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL A","USD","ABL.A Co.","XNYS/NYS-MAIN","",158,"ABL.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":377,"rowKey":"ABL.PA","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL PA","CAD","ABL.PA Co.","XNYS/NYS-MAIN","",463,"ABL.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":378,"rowKey":"ABL.MC","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL MC","EUR","ABL.MC Co.","XNYS/NYS-MAIN","",803,"ABL.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":379,"rowKey":"ABL.DE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABL DE","CAD","ABL.DE Co.","XNYS/NYS-MAIN","",903,"ABL.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":380,"rowKey":"ABM.L","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM LN","GBX","ABM.L London PLC","XLON/LSE-SETS","",414,"ABM.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":381,"rowKey":"ABM.N","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM US","GBX","ABM.N Corporation","XNGS/NAS-GSM","",588,"ABM.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":382,"rowKey":"ABM.OQ","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM OQ","EUR","ABM.OQ Co.","XNYS/NYS-MAIN","",182,"ABM.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":383,"rowKey":"ABM.AS","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM NL","GBX","ABM.AS B.V","XAMS/ENA-MAIN","",965,"ABM.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":384,"rowKey":"ABM.OE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM OE","GBX","ABM.OE Co.","XNYS/NYS-MAIN","",920,"ABM.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":385,"rowKey":"ABM.MI","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM MI","EUR","ABM.MI Co.","XNYS/NYS-MAIN","",629,"ABM.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":386,"rowKey":"ABM.A","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM A","GBX","ABM.A Co.","XNYS/NYS-MAIN","",491,"ABM.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":387,"rowKey":"ABM.PA","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM PA","CAD","ABM.PA Co.","XNYS/NYS-MAIN","",357,"ABM.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":388,"rowKey":"ABM.MC","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM MC","USD","ABM.MC Co.","XNYS/NYS-MAIN","",198,"ABM.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":389,"rowKey":"ABM.DE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABM DE","USD","ABM.DE Co.","XNYS/NYS-MAIN","",547,"ABM.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":390,"rowKey":"ABN.L","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN LN","EUR","ABN.L London PLC","XLON/LSE-SETS","",177,"ABN.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":391,"rowKey":"ABN.N","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN US","EUR","ABN.N Corporation","XNGS/NAS-GSM","",626,"ABN.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":392,"rowKey":"ABN.OQ","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN OQ","EUR","ABN.OQ Co.","XNYS/NYS-MAIN","",125,"ABN.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":393,"rowKey":"ABN.AS","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN NL","USD","ABN.AS B.V","XAMS/ENA-MAIN","",893,"ABN.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":394,"rowKey":"ABN.OE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN OE","GBX","ABN.OE Co.","XNYS/NYS-MAIN","",809,"ABN.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":395,"rowKey":"ABN.MI","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN MI","GBX","ABN.MI Co.","XNYS/NYS-MAIN","",49,"ABN.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":396,"rowKey":"ABN.A","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN A","CAD","ABN.A Co.","XNYS/NYS-MAIN","",250,"ABN.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":397,"rowKey":"ABN.PA","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN PA","EUR","ABN.PA Co.","XNYS/NYS-MAIN","",238,"ABN.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":398,"rowKey":"ABN.MC","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN MC","EUR","ABN.MC Co.","XNYS/NYS-MAIN","",197,"ABN.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":399,"rowKey":"ABN.DE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABN DE","CAD","ABN.DE Co.","XNYS/NYS-MAIN","",233,"ABN.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":400,"rowKey":"ABO.L","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO LN","USD","ABO.L London PLC","XLON/LSE-SETS","",468,"ABO.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":401,"rowKey":"ABO.N","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO US","CAD","ABO.N Corporation","XNGS/NAS-GSM","",505,"ABO.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":402,"rowKey":"ABO.OQ","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO OQ","CAD","ABO.OQ Co.","XNYS/NYS-MAIN","",932,"ABO.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":403,"rowKey":"ABO.AS","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO NL","USD","ABO.AS B.V","XAMS/ENA-MAIN","",180,"ABO.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":404,"rowKey":"ABO.OE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO OE","CAD","ABO.OE Co.","XNYS/NYS-MAIN","",607,"ABO.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":405,"rowKey":"ABO.MI","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO MI","CAD","ABO.MI Co.","XNYS/NYS-MAIN","",478,"ABO.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":406,"rowKey":"ABO.A","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO A","EUR","ABO.A Co.","XNYS/NYS-MAIN","",546,"ABO.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":407,"rowKey":"ABO.PA","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO PA","EUR","ABO.PA Co.","XNYS/NYS-MAIN","",430,"ABO.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":408,"rowKey":"ABO.MC","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO MC","CAD","ABO.MC Co.","XNYS/NYS-MAIN","",485,"ABO.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":409,"rowKey":"ABO.DE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABO DE","EUR","ABO.DE Co.","XNYS/NYS-MAIN","",412,"ABO.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":410,"rowKey":"ABP.L","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP LN","GBX","ABP.L London PLC","XLON/LSE-SETS","",802,"ABP.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":411,"rowKey":"ABP.N","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP US","CAD","ABP.N Corporation","XNGS/NAS-GSM","",610,"ABP.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":412,"rowKey":"ABP.OQ","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP OQ","CAD","ABP.OQ Co.","XNYS/NYS-MAIN","",220,"ABP.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":413,"rowKey":"ABP.AS","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP NL","EUR","ABP.AS B.V","XAMS/ENA-MAIN","",831,"ABP.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":414,"rowKey":"ABP.OE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP OE","GBX","ABP.OE Co.","XNYS/NYS-MAIN","",782,"ABP.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":415,"rowKey":"ABP.MI","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP MI","GBX","ABP.MI Co.","XNYS/NYS-MAIN","",730,"ABP.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":416,"rowKey":"ABP.A","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP A","USD","ABP.A Co.","XNYS/NYS-MAIN","",764,"ABP.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":417,"rowKey":"ABP.PA","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP PA","EUR","ABP.PA Co.","XNYS/NYS-MAIN","",289,"ABP.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":418,"rowKey":"ABP.MC","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP MC","GBX","ABP.MC Co.","XNYS/NYS-MAIN","",386,"ABP.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":419,"rowKey":"ABP.DE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABP DE","GBX","ABP.DE Co.","XNYS/NYS-MAIN","",941,"ABP.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":420,"rowKey":"ABQ.L","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ LN","USD","ABQ.L London PLC","XLON/LSE-SETS","",632,"ABQ.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":421,"rowKey":"ABQ.N","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ US","CAD","ABQ.N Corporation","XNGS/NAS-GSM","",530,"ABQ.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":422,"rowKey":"ABQ.OQ","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ OQ","GBX","ABQ.OQ Co.","XNYS/NYS-MAIN","",654,"ABQ.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":423,"rowKey":"ABQ.AS","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ NL","GBX","ABQ.AS B.V","XAMS/ENA-MAIN","",464,"ABQ.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":424,"rowKey":"ABQ.OE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ OE","EUR","ABQ.OE Co.","XNYS/NYS-MAIN","",50,"ABQ.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":425,"rowKey":"ABQ.MI","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ MI","EUR","ABQ.MI Co.","XNYS/NYS-MAIN","",529,"ABQ.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":426,"rowKey":"ABQ.A","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ A","CAD","ABQ.A Co.","XNYS/NYS-MAIN","",19,"ABQ.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":427,"rowKey":"ABQ.PA","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ PA","EUR","ABQ.PA Co.","XNYS/NYS-MAIN","",944,"ABQ.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":428,"rowKey":"ABQ.MC","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ MC","GBX","ABQ.MC Co.","XNYS/NYS-MAIN","",424,"ABQ.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":429,"rowKey":"ABQ.DE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABQ DE","CAD","ABQ.DE Co.","XNYS/NYS-MAIN","",938,"ABQ.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":430,"rowKey":"ABR.L","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR LN","GBX","ABR.L London PLC","XLON/LSE-SETS","",234,"ABR.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":431,"rowKey":"ABR.N","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR US","EUR","ABR.N Corporation","XNGS/NAS-GSM","",700,"ABR.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":432,"rowKey":"ABR.OQ","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR OQ","CAD","ABR.OQ Co.","XNYS/NYS-MAIN","",643,"ABR.OQ"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":433,"rowKey":"ABR.AS","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR NL","USD","ABR.AS B.V","XAMS/ENA-MAIN","",264,"ABR.AS"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":434,"rowKey":"ABR.OE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR OE","GBX","ABR.OE Co.","XNYS/NYS-MAIN","",626,"ABR.OE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":435,"rowKey":"ABR.MI","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR MI","USD","ABR.MI Co.","XNYS/NYS-MAIN","",525,"ABR.MI"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":436,"rowKey":"ABR.A","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR A","USD","ABR.A Co.","XNYS/NYS-MAIN","",853,"ABR.A"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":437,"rowKey":"ABR.PA","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR PA","EUR","ABR.PA Co.","XNYS/NYS-MAIN","",169,"ABR.PA"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":438,"rowKey":"ABR.MC","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR MC","CAD","ABR.MC Co.","XNYS/NYS-MAIN","",817,"ABR.MC"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":439,"rowKey":"ABR.DE","updateType":"U","ts":1639654847972,"sel":0,"data":["ABR DE","EUR","ABR.DE Co.","XNYS/NYS-MAIN","",582,"ABR.DE"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":440,"rowKey":"ABS.L","updateType":"U","ts":1639654847972,"sel":0,"data":["ABS LN","CAD","ABS.L London PLC","XLON/LSE-SETS","",32,"ABS.L"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":441,"rowKey":"ABS.N","updateType":"U","ts":1639654847972,"sel":0,"data":["ABS US","CAD","ABS.N Corporation","XNGS/NAS-GSM","",759,"ABS.N"]},{"viewPortId":"user-7d96f487-7cda-49e7-b92c-ba4915318528","vpSize":175760,"rowIndex":442,"rowKey":"ABS.OQ","updateType":"U","ts":1639654847972,"sel":0,"data":["ABS OQ","EUR","ABS.OQ Co.","XNYS/NYS-MAIN","",655,"ABS.OQ"]}]},"module":"CORE"}

11:40:52.926   Sending heartbeat
11:40:52.932   SVR IN:{"requestId":"NA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"HB_RESP","ts":1639654852928},"module":"CORE"}
11:40:57.933   Sending heartbeat
11:40:57.939   SVR IN:{"requestId":"NA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"HB_RESP","ts":1639654857935},"module":"CORE"}
11:41:02.940   Sending heartbeat
11:41:02.946   SVR IN:{"requestId":"NA","sessionId":"e0afa8c4-79bd-484f-9119-c43d8c0ff315","token":"903d591f-8270-4672-aeb5-c6a6cc48463e","user":"user","body":{"type":"HB_RESP","ts":1639654862943},"module":"CORE"}

//server disconnect
11:41:03.535 [nioEventLoopGroup-3-2] INFO  i.v.vuu.net.DefaultMessageHandler - Calling disconnect() from future callback
```

Data updates are of the below form:

```json
{
  "requestId": "NA",
  "sessionId": "e0afa8c4-79bd-484f-9119-c43d8c0ff315",
  "token": "",
  "user": "user",
  "body": {
    "type": "TABLE_ROW",
    "batch": "36922aea-ad02-4eae-9a09-10f0a4bb1297",
    "isLast": true,
    "timeStamp": 1639654847947,
    "rows": [
      {
        "viewPortId": "user-7d96f487-7cda-49e7-b92c-ba4915318528",
        "vpSize": 175760,
        "rowIndex": -1,
        "rowKey": "SIZE",
        "updateType": "SIZE",
        "ts": 1639654847946,
        "sel": 0,
        "data": []
      },
      {
        "viewPortId": "user-7d96f487-7cda-49e7-b92c-ba4915318528",
        "vpSize": 175760,
        "rowIndex": 0,
        "rowKey": "AAA.L",
        "updateType": "U",
        "ts": 1639654847947,
        "sel": 0,
        "data": [
          "AAA LN",
          "USD",
          "AAA.L London PLC",
          "XLON/LSE-SETS",
          "",
          633,
          "AAA.L"
        ]
      },
      {
        "viewPortId": "user-7d96f487-7cda-49e7-b92c-ba4915318528",
        "vpSize": 175760,
        "rowIndex": 1,
        "rowKey": "AAA.N",
        "updateType": "U",
        "ts": 1639654847947,
        "sel": 0,
        "data": [
          "AAA US",
          "EUR",
          "AAA.N Corporation",
          "XNGS/NAS-GSM",
          "",
          220,
          "AAA.N"
        ]
      },
      {
        "viewPortId": "user-7d96f487-7cda-49e7-b92c-ba4915318528",
        "vpSize": 175760,
        "rowIndex": 2,
        "rowKey": "AAA.OQ",
        "updateType": "U",
        "ts": 1639654847947,
        "sel": 0,
        "data": [
          "AAA OQ",
          "EUR",
          "AAA.OQ Co.",
          "XNYS/NYS-MAIN",
          "",
          393,
          "AAA.OQ"
        ]
      },
      {
        "viewPortId": "user-7d96f487-7cda-49e7-b92c-ba4915318528",
        "vpSize": 175760,
        "rowIndex": 3,
        "rowKey": "AAA.AS",
        "updateType": "U",
        "ts": 1639654847947,
        "sel": 0,
        "data": [
          "AAA NL",
          "GBX",
          "AAA.AS B.V",
          "XAMS/ENA-MAIN",
          "",
          449,
          "AAA.AS"
        ]
      },
      {
        "viewPortId": "user-7d96f487-7cda-49e7-b92c-ba4915318528",
        "vpSize": 175760,
        "rowIndex": 4,
        "rowKey": "AAA.OE",
        "updateType": "U",
        "ts": 1639654847947,
        "sel": 0,
        "data": [
          "AAA OE",
          "GBX",
          "AAA.OE Co.",
          "XNYS/NYS-MAIN",
          "",
          37,
          "AAA.OE"
        ]
      },
      {
        "viewPortId": "user-7d96f487-7cda-49e7-b92c-ba4915318528",
        "vpSize": 175760,
        "rowIndex": 5,
        "rowKey": "AAA.MI",
        "updateType": "U",
        "ts": 1639654847947,
        "sel": 0,
        "data": [
          "AAA MI",
          "CAD",
          "AAA.MI Co.",
          "XNYS/NYS-MAIN",
          "",
          38,
          "AAA.MI"
        ]
      },
      {
        "viewPortId": "user-7d96f487-7cda-49e7-b92c-ba4915318528",
        "vpSize": 175760,
        "rowIndex": 6,
        "rowKey": "AAA.A",
        "updateType": "U",
        "ts": 1639654847947,
        "sel": 0,
        "data": ["AAA A", "GBX", "AAA.A Co.", "XNYS/NYS-MAIN", "", 286, "AAA.A"]
      }
    ]
  },
  "module": "CORE"
}
```

Data is transmitted as an array in JSON as an optimization to allow us to transfer it directly into the grid on the client.
