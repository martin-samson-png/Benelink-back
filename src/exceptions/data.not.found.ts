class DataNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataNotFoundException";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default DataNotFoundException;
