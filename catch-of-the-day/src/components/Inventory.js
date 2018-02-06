import React from 'react'
import AddFishForm from './AddFishForm'
import base from '../base'

class Inventory extends React.Component {
    constructor() {
        super()
        this.renderInventory = this.renderInventory.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.authenticate = this.authenticate.bind(this)
        this.logout = this.logout.bind(this)
        this.authHandler = this.authHandler.bind(this)
        this.state = {
            uid: null,
            owner: null
        }
    }

    componentDidMount() {
        base.onAuth((user) => {
            if (user) {
                this.authHandler(null, { user })
            }
        })
    }

    handleChange(evt, key) {
        const fish = this.props.fishes[key]
        // Take a copy that fish state and update it with new data
        const updatedFish = {...fish, [evt.target.name]: evt.target.value}
        this.props.updateFish(key, updatedFish)
    }

    authenticate(provider) {
        console.log(`Trying to log in with ${provider}`)
        base.authWithOAuthPopup(provider, this.authHandler)
    }

    logout() {
        console.log("Logging out")
        base.unauth()
        this.setState({ uid: null })
    }

    authHandler(err, authData) {
        console.log(authData)
        if (err) {
            console.error(err)
            return
        }

        // Grab the store info and save in the state
        const storeRef = base.database().ref(this.props.storeId)

        // Query the firebase once for the store data
        storeRef.once('value', (snapshot) => {
            const data = snapshot.val() || {}

            // Claim it as our own if there is no owner already
            if (!data.owner) {
                storeRef.set({
                    owner: authData.user.uid
                })
            }

            this.setState({
                uid: authData.user.uid,
                owner: data.owner || authData.user.uid
            })
        })
    }

    renderLogin(key) {
        return (
            <nav>
                <h2>Inventory</h2>
                <p>Sign in to manage your store's inventory</p>
                <button className="github" onClick={() => this.authenticate('github')}>Log in with GitHub</button>
                <button className="facebook" onClick={() => this.authenticate('facebook')}>Log in with Facebook</button>
                <button className="twitter" onClick={() => this.authenticate('twitter')}>Log in with Twitter</button>
            </nav>
        )
    }

    renderInventory(key) {
        const fish = this.props.fishes[key]
        
        return (<div className="fish-edit" key={key}>
            <input type="text" name="name" value={fish.name} placeholder="Fish name" onChange={(e) => this.handleChange(e, key)} />
            <input type="text" name="price" value={fish.price} placeholder="Fish price" onChange={(e) => this.handleChange(e, key)} /> 
            <select type="text" name="status" value={fish.status} placeholder="Fish status" onChange={(e) => this.handleChange(e, key)} >
                <option value="available">Fresh!</option>
                <option value="unavailable">Sold out!</option>
            </select> 
            <textarea type="text" name="desc" value={fish.desc} placeholder="Fish desc" onChange={(e) => this.handleChange(e, key)}>
            </textarea> 
            <input type="text" name="image" value={fish.image} placeholder="Fish image" onChange={(e) => this.handleChange(e, key)} /> 
            <button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
        </div>)
    }

    render() {
        const logout = <button onClick={this.logout}>Log Out!</button>

        // Check if they are not logged in at all
        if (!this.state.uid) {
            console.log('Not logged in')
            return <div>{this.renderLogin()}</div>
        }

        // Check if they are the owner of the store
        if (this.state.uid !== this.state.owner) {
            return (
                <div>
                    <p>Sorry, you are not the owner of this store!</p>
                    {logout}
                </div>
            )
        }

        return (
            <div>
                <h2>Inventory</h2>
                {logout}
                {Object.keys(this.props.fishes).map(this.renderInventory)}
                <AddFishForm addFish={this.props.addFish} />
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
            </div>
        )
    }

    // Just to try Wes Bos tip of trying a new ES2017 feature, 
    // use a property initialiser inside the component instead 
    // of a static definition outside
    static propTypes = {
        fishes: React.PropTypes.object.isRequired,
        updateFish: React.PropTypes.func.isRequired,
        addFish: React.PropTypes.func.isRequired,
        removeFish: React.PropTypes.func.isRequired,
        loadSamples: React.PropTypes.func.isRequired,
        storeId: React.PropTypes.string.isRequired
    }
}

// Just to try Wes Bos tip of trying a new ES2017 feature, 
// use a property initialiser inside the component instead 
// of this static definition outside
/*
Inventory.propTypes = {
    fishes: React.PropTypes.object.isRequired,
    updateFish: React.PropTypes.func.isRequired,
    addFish: React.PropTypes.func.isRequired,
    removeFish: React.PropTypes.func.isRequired,
    loadSamples: React.PropTypes.func.isRequired,
    storeId: React.PropTypes.string.isRequired
}
*/

export default Inventory