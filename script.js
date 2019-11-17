
const CONTRACT_ADDRESS = "0x2764dA8A1b5e3f8bBFD213aBfEf4826b17add66b"

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

        Actions.refreshUI();
    
        Helpers.onclick("donate",Listeners.onDonateClicked)
        Helpers.onclick("withdraw",Listeners.onWithdrawClicked)
    
    },
    events: () => {
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
        get: async ()=>{
            const amount = await Helpers.call("minimum");
            return web3.utils.fromWei(amount,"ether")
        }
    },
    amount: {
        set: (a)=>{
           Helpers.updateTag('amount',a);
        },
        get: async ()=>{
            const amount = await Helpers.call("amount");
            return web3.utils.fromWei(amount,"ether")
        }
    },
    donation: {
        set: (d)=>{
            Helpers.updateTag('donation',d);
        },
        get: async ()=>{
            const amount = await SmartFunding.methods.donators(account).call();
            return web3.utils.fromWei(amount,"ether")
        }
    },
    address: {
        set: (a)=>{
            Helpers.updateTag('address',a);
        },
        get: ()=>{
            return Promise.resolve(account)
        }
    },
    owner: {
        get: ()=>{
            return Helpers.call("owner");
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
        Actions.notify("goal reached",true);
        Actions.refreshUI();
    },
    onNewDonator: (error,event) => {
        if( error ) console.error(error);
        else {
            console.log("new donator",event.returnValues.donator,event.returnValues.amount);
            Actions.notify("new donation");
            Actions.refreshUI();
        }
    },
    onDonateClicked: ()=>{
        const amount = document.getElementById("donate-amount").value;
        Actions.donate(amount);
    },
    onWithdrawClicked: ()=>{
        Actions.withdraw();
    }
}

const Actions = {
    notify: (text,success=false)=>{
        Toastify({ text, duration: 3000, backgroundColor: success? "#1DB100" : "#929292", className: "notification" }).showToast();
    },
    donate: (amount="0.01")=>{
        console.log("donate",amount);
        SmartFunding.methods.donate().send({from: account,value: web3.utils.toWei(amount)})
    },
    withdraw: ()=>{
        SmartFunding.methods.withdraw().send({from: account})
    },
    refreshUI: ()=>{
        ["nbDonators","goal","amount","donation","address"]
            .forEach((e)=>{
                Data[e].get().then(Data[e].set);
            });
    }
}

Setup.init();
