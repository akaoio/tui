#!/bin/bash

# ERP System Demo Script
# Automatically navigates through the ERP system

echo "Starting ERP System Demo..."
sleep 1

# Create a pipe for input
mkfifo /tmp/erp_input 2>/dev/null || true

# Start the ERP system with input from pipe
node examples/erp-system.js < /tmp/erp_input &
ERP_PID=$!

# Function to send keys
send_key() {
    echo -ne "$1" > /tmp/erp_input
    sleep 0.5
}

# Wait for startup
sleep 2

# Press Enter to start
send_key "\n"
sleep 1

# Navigate through modules
echo "Navigating to Customers..."
send_key "2"  # Jump to Customers
sleep 1

echo "Navigating to Inventory..."
send_key "3"  # Jump to Inventory
sleep 1

echo "Checking Orders..."
send_key "4"  # Jump to Orders
sleep 1

echo "Viewing Invoices..."
send_key "5"  # Jump to Invoices
sleep 1

echo "Back to Dashboard..."
send_key "1"  # Back to Dashboard
sleep 1

echo "Showing Help..."
send_key "?"  # Show help
sleep 2

send_key "\n"  # Exit help
sleep 1

echo "Exiting..."
send_key "\x1b"  # ESC to exit

# Cleanup
kill $ERP_PID 2>/dev/null
rm -f /tmp/erp_input

echo "Demo completed!"