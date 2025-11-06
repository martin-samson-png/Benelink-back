export class InternalServerException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalServerException";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
