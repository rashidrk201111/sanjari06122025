from rest_framework import serializers
from .models import Order, FileItem, Payment

class FileItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileItem
        fields = ['id','file_name','total_pages','start_page','end_page','copies','upload','remote_url']

class OrderSerializer(serializers.ModelSerializer):
    files = FileItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id','order_number','created_at','name','email','phone','subtotal','total_pages','files']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id','order','phonepe_order_id','amount','status','created_at']
