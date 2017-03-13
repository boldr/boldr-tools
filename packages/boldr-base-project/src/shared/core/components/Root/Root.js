import React, { PropTypes, PureComponent } from 'react';
import { StaticRouter, BrowserRouter } from 'react-router-dom';

class Root extends PureComponent {
  render() {
    const {
 server, children,
} = this.props;
    return (
    <div>
      {
        server &&
        <StaticRouter { ...server }>
          <div>
            { children }
          </div>
        </StaticRouter>
      }
      {
        !server &&
        <BrowserRouter>
          <div>
            { children }
          </div>
        </BrowserRouter>
      }
    </div>
    );
  }
}

Root.displayName = 'RootComponent';

Root.propTypes = {
  basename: PropTypes.string,
  children: PropTypes.node.isRequired,
  server: PropTypes.oneOfType([
    PropTypes.bool.isRequired,
    PropTypes.object.isRequired,
  ]),
};

export default Root;
