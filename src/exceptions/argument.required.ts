class ArgumentRequiredException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArgumentRequiredException";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default ArgumentRequiredException;
