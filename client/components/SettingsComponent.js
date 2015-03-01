/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var Helpers = require('../Helpers');

var debug = Helpers.debug;
var assert = Helpers.assert;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

var Account = React.createClass({
    onDelete: function(id) {
        flux.dispatch({
            type: Events.user.deleted_account,
            account: this.props.account
        });
    },

    render: function() {

        var a = this.props.account;

        return <tr>
            <td>{a.title}</td>
            <td>
                <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                    data-toggle="modal" data-target={'#confirmDeleteAccount' + a.id}>
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>

                <div className="modal fade" id={'confirmDeleteAccount' + a.id} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title" id="myModalLabel">Confirm deletion</h4>
                      </div>
                      <div className="modal-body">
                       This will erase this account "{a.title}" and all
                       transactions that it contained. If it
                       is the last account bound to this bank account, the bank account will be
                       deleted as well. Are you sure you want to erase this account?
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Don't delete</button>
                        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.onDelete}>Confirm deletion</button>
                      </div>
                    </div>
                  </div>
                </div>
            </td>
        </tr>
    }
});

var BankAccounts = React.createClass({

    getInitialState: function() {
        return {
            accounts: []
        }
    },

    listener: function() {
        this.setState({
            accounts: store.getBankAccounts(this.props.bank.id)
        });
    },

    componentDidMount: function() {
        store.on(Events.server.loaded_accounts_any_bank, this.listener);
        store.loadAccountsAnyBank(this.props.bank);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.server.loaded_accounts_any_bank, this.listener);
    },

    onDeleteBank: function() {
        flux.dispatch({
            type: Events.user.deleted_bank,
            bank: this.props.bank
        });
    },

    render: function() {
        var self = this;
        var accounts = this.state.accounts.map(function(acc) {
            return <Account key={acc.id} account={acc} setupModal={self.props.setupModal} />
        });

        var b = self.props.bank;

        return <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{this.props.bank.name}
                            <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                              data-toggle="modal" data-target={'#confirmDeleteBank' + b.id}>
                                <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                            </button>
                        </h3>
                    </div>

                <div className="modal fade" id={'confirmDeleteBank' + b.id} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 className="modal-title" id="myModalLabel">Confirm deletion</h4>
                      </div>
                      <div className="modal-body">
                       This will erase this bank "{b.name}" and all
                       accounts and transactions that are associated with it. Are you sure you want to erase this bank and all associated accounts?
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Don't delete</button>
                        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.onDeleteBank}>Confirm deletion</button>
                      </div>
                    </div>
                  </div>
                </div>

                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts}
                        </tbody>
                    </table>
                </div>
    }
});

var NewBankForm = React.createClass({

    getInitialState: function() {
        return {
            expanded: false
        }
    },

    toggleExpand: function() {
        this.setState({
            expanded: !this.state.expanded
        });
    },

    domBank: function() {
        return this.refs.bank.getDOMNode();
    },
    domId: function() {
        return this.refs.id.getDOMNode();
    },
    domPassword: function() {
        return this.refs.password.getDOMNode();
    },

    onSubmit: function() {
        var bank = this.domBank().value;
        var id = this.domId().value;
        var pwd = this.domPassword().value;

        this.setState({
            expanded: false
        });

        flux.dispatch({
            type: Events.user.created_bank,
            bankUuid: bank,
            id: id,
            pwd: pwd
        });
    },

    render: function() {
        var maybeForm = <div className="transition-expand"/>

        if (this.state.expanded) {
            var options = store.getStaticBanks().map(function(bank) {
                return <option key={bank.id} value={bank.uuid}>{bank.name}</option>
            });
            maybeForm = <div className="panel-body transition-expand">
                <div className="form-group">
                    <label htmlFor="bank">Bank</label>
                    <select className="form-control" id="bank" ref="bank">
                        {options}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="id">ID</label>
                    <input type="text" className="form-control" id="id" placeholder="Enter here your bank identifier" ref="id" />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" className="form-control" id="password" ref="password" />
                </div>

                <input type="submit" className="btn btn-save pull-right" onClick={this.onSubmit} value="Save" />
            </div>;
        }

        return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">Configure a new bank access
                    <button type="button" className="btn btn-danger pull-right" aria-label="add" onClick={this.toggleExpand}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    </button>
                </h3>
                {maybeForm}
            </div>
        </div>
        );
    }
});

var BankAccountsList = React.createClass({

    getInitialState: function() {
        return {
            banks: []
        }
    },

    _listener: function() {
        this.setState({
            banks: store.getBanks()
        })
    },

    componentDidMount: function() {
        store.subscribeMaybeGet(Events.server.loaded_banks, this._listener);
    },

    componentWillUnmount: function() {
        store.removeListener(Events.server.loaded_banks, this._listener);
    },

    render: function() {
        var banks = this.state.banks.map(function(bank) {
            return <BankAccounts key={bank.id} bank={bank} />
        });

        return (<div>
        <NewBankForm/>
        <div>
            {banks}
        </div>
        </div>)
    }
});

var SettingsComponent = module.exports = React.createClass({

    getInitialState: function() {
        return {
            showing: 'accounts',
            // settings
            duplicateThreshold: store.getSetting('duplicateThreshold')
        }
    },

    componentDidMount: function() {
    },

    componentWillUnmount: function() {
    },

    _show: function(which) {
        return function() {
            this.setState({
                showing: which
            });
        }.bind(this);
    },

    _onChange: function(e) {
        var val = this.refs.duplicateThreshold.getDOMNode().value;
        flux.dispatch({
            type: Events.user.changed_setting,
            key: 'duplicateThreshold',
            value: val
        });
        this.setState({
            duplicateThreshold: val
        });
        return true;
    },

    render: function() {

        var self = this;
        function MaybeActive(name) {
            return self.state.showing === name ? 'active' : '';
        }

        var Tab;
        switch (this.state.showing) {
          case 'accounts':
           Tab = <BankAccountsList/>;
           break;
          case 'advanced':
           Tab = <form className="form-horizontal">
                    <div className="form-group">
                        <label htmlFor="duplicateThreshold" className="col-xs-4 control-label">Duplicate threshold</label>
                        <div className="col-xs-8">
                            <input id="duplicateThreshold" ref="duplicateThreshold" type="number" className="form-control"
                                min="0" step="1"
                                value={this.state.duplicateThreshold} onChange={this._onChange} />
                        </div>
                    </div>
                  </form>;
           break;
          default:
           assert(true === false, 'unknown state to show in settings');
        }

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">Settings</h3>
                    </div>

                    <div className="panel-body">
                        <ul className="col-xs-3 nav nav-pills nav-stacked pull-left">
                            <li role="presentation" className={MaybeActive('accounts')}><a href="#" onClick={this._show('accounts')}>Bank accounts</a></li>
                            <li role="presentation" className={MaybeActive('advanced')}><a href="#" onClick={this._show('advanced')}>Advanced</a></li>
                        </ul>

                        <div className="col-xs-9">
                            {Tab}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

