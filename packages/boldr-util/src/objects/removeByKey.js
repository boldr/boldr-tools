import reduce from 'lodash/reduce';

const removeByKey = (myObj, deleteKey) => {
  return Object.keys(myObj)
    // Filter out the key from the object
    .filter(key => key !== deleteKey.toString())
    // Create new object without that key.
    .reduce((result, current) => {
      result[current] = myObj[current];
      return result;
    }, {});
};

export default removeByKey;
