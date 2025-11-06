class ForbiddenException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenException";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default ForbiddenException;
