import HomeContainer from './Home';
import Tools from './Tools';

export default [
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
];
