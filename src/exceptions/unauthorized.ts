class UnauthorizedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedException";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default UnauthorizedException;
