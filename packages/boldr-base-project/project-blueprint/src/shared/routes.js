import App from './components/App';
import HomeContainer from './scenes/Home';
import NotFound from './components/NotFound';
import Tools from './scenes/Tools';

export default [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: HomeContainer,
      },
      {
        path: '/tools',
        exact: true,
        component: Tools,
      },
      {
        path: '*',
        component: NotFound,
      },
    ],
  },
];