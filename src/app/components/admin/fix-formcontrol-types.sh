#!/bin/bash

# Script para arreglar los errores de TypeScript en los FormControls
# Agrega el operador ! para indicar que el valor no es null

# User Management Component
sed -i 's/\[formControl\]="editingForm\.get(\(.*\))"/[formControl]="editingForm.get(\1)!"/g' user-management/user-management.component.html

# Organismo Management Component
sed -i 's/\[formControl\]="editingForm\.get(\(.*\))"/[formControl]="editingForm.get(\1)!"/g' organismo-management/organismo-management.component.html

# Contrato Management Component
sed -i 's/\[formControl\]="editingForm\.get(\(.*\))"/[formControl]="editingForm.get(\1)!"/g' contrato-management/contrato-management.component.html

echo "FormControl types fixed!"