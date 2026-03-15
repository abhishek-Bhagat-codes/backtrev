import pickle

# Load the model
with open('models/anomaly_model.pkl', 'rb') as f:
    model = pickle.load(f)

# 1. Type
print('1. TYPE:', type(model).__name__)

# 2. Methods
print('\n2. METHODS:')
methods = [m for m in dir(model) if not m.startswith('_')]
for m in ['predict', 'decision_function', 'score_samples', 'fit']:
    has_it = m in methods
    print('   ' + m + ': ' + ('yes' if has_it else 'no'))
print('   All public methods:', methods)

# 3. Expected input shape
if hasattr(model, 'n_features_in_'):
    print('\n3. EXPECTED n_features_in_:', model.n_features_in_)
if hasattr(model, 'n_features_'):
    print('   n_features_:', model.n_features_)

# 4. Test prediction
import numpy as np
sample = np.array([[28.6, 77.2, 10.0]])
print('\n4. TEST PREDICTION with [[28.6, 77.2, 10.0]]:')
pred = model.predict(sample)
print('   predict():', pred)
if hasattr(model, 'decision_function'):
    df = model.decision_function(sample)
    print('   decision_function():', df)
if hasattr(model, 'score_samples'):
    ss = model.score_samples(sample)
    print('   score_samples():', ss)
