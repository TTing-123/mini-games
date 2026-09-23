extends Area2D

signal split_requested(ball: RigidBody2D)

var used := false


func _ready() -> void:
	body_entered.connect(_on_body_entered)


func reset_state() -> void:
	used = false


func _on_body_entered(body: Node) -> void:
	if used or not (body is RigidBody2D):
		return
	if not body.can_split:
		return
	used = true
	emit_signal("split_requested", body)