
const CONTRACT_ADDRESS = "0x5a55B7FF38Db8A3AfEf66d93802d2FBC75C41865"

var SmartFunding, web3, account;

const Setup = {
    loginMetamask: async () => {

        if (typeof window.ethereum === 'undefined') {
            alert('Looks like you need a Dapp browser to get started. Consider installing MetaMask!')
            return;
        }
    
        return ethereum.enable()
            .then(accounts=>accounts[0])
            .catch(reason=>{
                if (reason === 'User rejected provider access') {
                    // The user didn't want to sign in!
                    alert('User rejected provider access')
                } else {
                    // This shouldn't happen, so you might want to log this...
                    alert('There was an issue signing you in.')
                    console.error(reason)
                }
            })
    },
    web3: async () => {
        return new Web3(window.ethereum);
    },
    SmartFunding: async () => {
        const abi = await fetch('./abi.json').then(response=>response.json())
        return new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    },
    ui: () => {

        ["nbDonators","goal","amount","donation","address"]
            .forEach((e)=>{
                Data[e].get().then(Data[e].set);
            });
    
        Helpers.onclick("donate",Listeners.onDonateClicked)
        Helpers.onclick("withdraw",Listeners.onWithdrawClicked)
    
    },
    events: () => {
        SmartFunding.once("NewDonation",{filter:{donator:account}},Listeners.onNewDonation)
        SmartFunding.once("NewDonation",Listeners.onNewDonator)
        SmartFunding.once("GoalReached",Listeners.onGoalReached)
    },
    init: async () => {
        account = await Setup.loginMetamask();
        web3 = await Setup.web3();
        SmartFunding = await Setup.SmartFunding();
        Setup.ui();
        Setup.events();
    }
}

const Data = {
    nbDonators: {
        set: (nb)=>{
            Helpers.updateTag('nb_donators',nb);
        },
        get: ()=>{
            return Helpers.call("nbDonators")
        }
    },
    goal: {
        set: (g)=>{
            Helpers.updateTag('goal',g);
        },
        get: ()=>{
            return Helpers.call("minimum")
        }
    },
    amount: {
        set: (a)=>{
           Helpers.updateTag('amount',a);
        },
        get: ()=>{
            return Helpers.call("amount");
        }
    },
    donation: {
        set: (d)=>{
            Helpers.updateTag('donation',d);
        },
        get: ()=>{
            return SmartFunding.methods.donators(account).call();
        }
    },
    address: {
        set: (a)=>{
            Helpers.updateTag('address',a);
        },
        get: ()=>{
            return Promise.resolve(account)
        }
    }
}

const Helpers = {
    call: (method)=>{
        return SmartFunding.methods[method]().call();
    },
    updateTag: (id,value)=>{
        document.getElementById(id).innerHTML = value;
    },
    onclick: (id,cb)=>{
        document.getElementById(id).onclick = cb
    }

}

const Listeners = {
    onGoalReached: () => {
        Actions.notify("goal reached");
    },
    onNewDonation: () => {
        Helpers.donation.get().then(Helpers.donation.set);
    },
    onNewDonator: (error,event) => {
        if( error ) console.error(error);
        else {
            const { donator, amount } = event.returnValues
            console.log("new donator",donator,amount);
            Actions.notify("new donator");
        }
    },
    onDonateClicked: ()=>{
        Actions.notify("donate");
    },
    onWithdrawClicked: ()=>{
        Actions.notify("withdraw",true);
    }
}

const Actions = {
    notify: (text,success=false)=>{
        Toastify({ text, duration: 3000, backgroundColor: success? "#1DB100" : "#929292", className: "notification" }).showToast();
    }
}

Setup.init();
