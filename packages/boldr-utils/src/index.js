import { loadRoute, errorLoading } from './routeHelpers';
import { filterWithRules, mergeDeep, getIn, setIn, removeByKey } from './objects';
import { ifElse, requiredParam, validateId } from './logic';
import {
  removeNil,
  flatten,
  addIdToArray,
  removeIdFromArray,
  removeKeyFromNestedArray,
  stringifiedArray,
  validateArray,
} from './arrays';

const logger = require('./logger');

module.exports = {
  loadRoute,
  errorLoading,
  removeNil,
  logger,
  flatten,
  addIdToArray,
  removeIdFromArray,
  removeKeyFromNestedArray,
  stringifiedArray,
  validateArray,
  ifElse,
  requiredParam,
  validateId,
  filterWithRules,
  mergeDeep,
  getIn,
  setIn,
  removeByKey,
};
