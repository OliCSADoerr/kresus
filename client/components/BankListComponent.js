/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var Helpers = require('../Helpers');
var debug = Helpers.debug;
var t = Helpers.translate;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

// Props: bank: Bank
var BankListItemComponent = React.createClass({

    _onClick: function() {
        flux.dispatch({
            type: Events.user.selected_bank,
            bankId: this.props.bank.id
        });
    },

    // TODO make a real "active" state
    render: function() {
        return (
            <li className="active"><span><a href="#" onClick={this._onClick}>{this.props.bank.name}</a></span></li>
        );
    }
});

// State: [{name: bankName, id: bankId}]
var BankListComponent = module.exports = React.createClass({

    _bankListListener: function() {
        this.setState({
            banks: store.getBanks()
        });
    },

    getInitialState: function() {
        return {
            banks: []
        }
    },

    componentDidMount: function() {
        store.on(Events.state.banks, this._bankListListener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.state.banks, this._bankListListener);
    },

    render: function() {
        var banks = this.state.banks.map(function (b) {
            return (
                <BankListItemComponent key={b.id} bank={b} />
            )
        });

        return (
            <div className="sidebar-list">
                <ul className="sidebar-sublist"><span className="topic">{t('Banks')}</span>
                    {banks}
                </ul>
            </div>
        );
    }
});