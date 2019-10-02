class ValidationError extends Error { };
class TransactionError extends ValidationError { }

module.exports = {
    ValidationError: ValidationError,
    TransactionError: TransactionError
}