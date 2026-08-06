# gradient_descent.py
# Lesson 2: Linear Algebra & Derivatives from the command line — Practical AI Engineer series
#
# Gradient Descent implemented from scratch, with no external libraries.
# Run it with:  python gradient_descent.py
#
# Goal: find the minimum of f(x) = x^2 - 4x + 4.
# Because f(x) = (x - 2)^2, we already know the answer: the minimum value is 0,
# reached at x = 2. Knowing the answer in advance is the point — it lets us watch
# the algorithm walk towards it and check that it really arrives. The algorithm
# itself is never told the number 2; all it ever gets is the local slope.


def f(x):
    """The loss function we are minimising."""
    return x**2 - 4 * x + 4


def numerical_derivative(func, x, h=1e-5):
    """Approximate the derivative with a finite difference."""
    return (func(x + h) - func(x)) / h


# Hyperparameters — values WE choose, which the algorithm never changes.
x = 10.0  # starting guess, deliberately far from the answer
learning_rate = 0.1  # how big a step to take each iteration
# 100 is not arbitrary: with learning_rate = 0.1 the step size drops below
# `tolerance` on iteration 66, so the early stop below actually fires. At
# epochs = 50 the loop would end first and you would never see that message.
epochs = 100
tolerance = 1e-6  # stop once x barely moves any more

for epoch in range(1, epochs + 1):
    grad = numerical_derivative(f, x)

    # Step AGAINST the slope. This one line does all the learning.
    x_new = x - learning_rate * grad

    # Converged: x stopped moving, so more iterations would change nothing.
    if abs(x_new - x) < tolerance:
        print(f"Converged early at iteration {epoch}. x = {x_new:.6f}")
        x = x_new
        break

    x = x_new
    print(f"Iteration {epoch:02d}: x = {x:.6f} | loss = {f(x):.6f}")

print(f"\nResult: x = {x:.6f} | minimum value: f(x) = {f(x):.6f}")

# Things worth trying, one line each:
#   learning_rate = 0.5     -> converges on iteration 2
#   learning_rate = 0.0001  -> stops on iteration 36887, at x = 2.004993 (not 2!)
#   learning_rate = 1.0     -> bounces between 10 and -6 forever
#   learning_rate = 1.5     -> diverges; by iteration 40, x is about 2.4e11
