import {
  filterWithRules,
  mergeDeep,
  getIn,
  setIn,
  removeByKey,
  getField,
} from './objects';
import {
  ifElse,
  requiredParam,
  validateId,
  sort,
  uniq,
  isPromise,
} from './logic';
import {
  removeNil,
  flatten,
  addIdToArray,
  removeIdFromArray,
  removeKeyFromNestedArray,
  stringifiedArray,
  validateArray,
} from './arrays';
import reduceKey from './state/reduceKey';

const logger = require('./logger');

module.exports = {
  isPromise,
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
  sort,
  uniq,
  reduceKey,
  getField,
};
