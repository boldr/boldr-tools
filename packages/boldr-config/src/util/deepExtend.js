/**
 * Determine whether or not a value is the specific value
 * @param  {string|number}  val the target
 * @return {Boolean}     it is or isnt the value we're looking for.
 */
const isSpecificValue = val =>
  ((typeof Buffer !== 'undefined' && val instanceof Buffer) ||
    val instanceof Date ||
    val instanceof RegExp
    ? true
    : false);

/**
 * Clone a specific type of value
 * @param  {string|number} val a dateTime or regex
 * @return {string|number}     a cloned copy of the value
 */
const cloneSpecificValue = val => {
  if (typeof Buffer !== 'undefined' && val instanceof Buffer) {
    const x = new Buffer(val.length);
    val.copy(x);
    return x;
  } else if (val instanceof Date) {
    return new Date(val.getTime());
  } else if (val instanceof RegExp) {
    return new RegExp(val);
  } else {
    throw new Error('Unexpected situation');
  }
};

/**
 * Recursive cloning array.
 * @param  {array} arr array which will be cloned
 * @return {array}     the cloned array
 */
const deepCloneArray = arr => {
  const clone = [];
  arr.forEach((item, index) => {
    if (typeof item === 'object' && item !== null) {
      if (Array.isArray(item)) {
        clone[index] = deepCloneArray(item);
      } else if (isSpecificValue(item)) {
        clone[index] = cloneSpecificValue(item);
      } else {
        clone[index] = deepExtend({}, item);
      }
    } else {
      clone[index] = item;
    }
  });
  return clone;
};

/**
 * Extening object that entered in first argument.
 *
 * Returns extended object or false if have no target object or incorrect
 * type.
 *
 * If you wish to clone source object (without modify it), just use empty
 * new object as first argument, like this:
 *   deepExtend({}, yourObj_1, [yourObj_N]);
 */
const deepExtend = function(/*obj_1, [obj_2], [obj_N]*/) {
  if (arguments.length < 1 || typeof arguments[0] !== 'object') {
    return false;
  }

  if (arguments.length < 2) {
    return arguments[0];
  }

  const target = arguments[0];

  // convert arguments to array and cut off target object
  let args = Array.prototype.slice.call(arguments, 1);
  // filter out all null and undefined args
  args = args.filter(function(arg) {
    return arg !== null;
  });

  let val, src, clone;

  args.forEach(obj => {
    // skip argument if it is array or isn't object
    if (typeof obj !== 'object' || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(key => {
      // source value
      src = target[key];
      // new value
      val = obj[key];

      // recursion prevention
      if (val === target) {
        return;
      } else if (typeof val !== 'object' || val === null) {
        // if new value isn't object then just overwrite by new value
        // instead of extending.
        target[key] = val;
        return;
      } else if (Array.isArray(val)) {
        // just clone arrays (and recursive clone objects inside)
        target[key] = deepCloneArray(val);
        return;
      } else if (isSpecificValue(val)) {
        // custom cloning and overwrite for specific objects
        target[key] = cloneSpecificValue(val);
        return;
      } else if (
        typeof src !== 'object' ||
        src === null ||
        Array.isArray(src)
      ) {
        // overwrite by new value if source isn't object or array
        target[key] = deepExtend({}, val);
        return;
      } else {
        // source value and new value is objects both, extending...
        target[key] = deepExtend(src, val);
        return;
      }
    });
  });

  return target;
};

export default deepExtend;
