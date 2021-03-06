import React from 'react'
import Header from './Header'
import Order from './Order'
import Inventory from './Inventory'
import Fish from './Fish'
import sampleFishes from '../sample-fishes'
import base from '../base'

class App extends React.Component {
    constructor() {
        super()
        this.addFish = this.addFish.bind(this)
        this.updateFish = this.updateFish.bind(this)
        this.removeFish = this.removeFish.bind(this)
        // Just to try Wes Bos tip of trying a new ES2017 feature, 
        // use a property initialiser instead of this constructor bind
        //this.loadSamples = this.loadSamples.bind(this)
        this.addToOrder = this.addToOrder.bind(this)
        this.removeFromOrder = this.removeFromOrder.bind(this)

        // getInitialState
        //this.state = {
        //    fishes: {},
        //    order: {}
        //}
    }

    // Just to try Wes Bos tip of trying a new ES2017 feature, 
    // use a property initialiser instead of inside the constructor
    state = {
        fishes: {},
        order: {}
    }

    componentWillMount() {
        // This runs right before the <App> is rendered
        this.ref = base.syncState(`${this.props.params.storeId}/fishes`, {
            context: this,
            state: 'fishes'
        })

        // Check if there is any order in localStorage
        const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`)
        if (localStorageRef) {
            // Update App component's order state
            this.setState({
                order: JSON.parse(localStorageRef)
            })
        }
    }

    componentWillUnmount() {
        base.removeBinding(this.ref)
    }

    componentWillUpdate(nextProps, nextState) {
        localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order))
    }

    addFish(fish) {
        // update state
        const fishes = {...this.state.fishes}
        // add in new fish
        const timestamp = Date.now()
        fishes[`fish-${timestamp}`] = fish
        // set state
        this.setState({ fishes })
    }

    updateFish(key, updatedFish) {
        const fishes = {...this.state.fishes}
        fishes[key] = updatedFish
        this.setState({ fishes })
    }

    removeFish(key) {
        const fishes = {...this.state.fishes}
        fishes[key] = null
        this.setState({ fishes })      
    }

    // Just to try Wes Bos tip of trying a new ES2017 feature, 
    // use a property initialiser instead of a constructor bind
    loadSamples = () => {
        this.setState({
            fishes: sampleFishes
        })
    }

    addToOrder(key) {
        // copy the state
        const order = {...this.state.order}
        // update or add number if fish ordered
        order[key] = order[key] + 1 || 1
        // update state
        this.setState({ order })
    }

    removeFromOrder(key) {
        const order = {...this.state.order}
        delete order[key]
        this.setState({ order })
    }

    render() {
        return (
            <div className="catch-of-the-day">
                <div className="menu">
                    <Header tagline="Fresh Seafood Market" />
                    <ul className="list-of-fishes">
                        {Object
                            .keys(this.state.fishes)
                            .map(key => <Fish key={key} 
                                index={key} 
                                details={this.state.fishes[key]} 
                                addToOrder={this.addToOrder} 
                                removeFromOrder={this.removeFromOrder}/>)}
                    </ul>
                </div>
                <Order 
                    fishes={this.state.fishes} 
                    order={this.state.order}
                    params={this.props.params}
                    removeFromOrder={this.removeFromOrder} />
                <Inventory 
                    addFish={this.addFish} 
                    updateFish={this.updateFish}
                    removeFish={this.removeFish}
                    loadSamples={this.loadSamples}
                    fishes={this.state.fishes}
                    storeId={this.props.params.storeId} />
            </div>
        )
    }
}

App.propTypes = {
    params: React.PropTypes.object.isRequired
}

export default App