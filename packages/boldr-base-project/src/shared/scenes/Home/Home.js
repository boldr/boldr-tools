import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

class Home extends Component {
  static displayName = 'Home';
  static propTypes = {
    data: PropTypes.array,
    loaded: PropTypes.boolean,
  }

  renderList = () => {
    return (
      <ul>
        { this.props.data.map(p => <li key={ p.id }>{p.title}</li>) }
      </ul>
    );
  }
  render() {
    // if (!this.props.loaded) {
    //   return (
    //     <h1>Loading....</h1>
    //   );
    // }
    return (
      <div>
        <Helmet title="Home" />
        <div className="wrapper">

          <h1>Boldr</h1>
          <h3>Dumb home page</h3>
          { /* this.renderList() */ }


          </div>
      </div>
    );
  }
}

export default Home;
