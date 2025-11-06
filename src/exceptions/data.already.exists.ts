class DataAlreadyExistException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataAlreadyExistException";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default DataAlreadyExistException;
