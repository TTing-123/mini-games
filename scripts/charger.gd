extends Area2D

signal charge_granted(charger: Area2D)

var used := false


func _ready() -> void:
	body_entered.connect(_on_body_entered)


func reset_state() -> void:
	used = false
	monitoring = true
	visible = true
	modulate = Color.WHITE
	scale = Vector2.ONE


func _on_body_entered(body: Node) -> void:
	if used or not (body is RigidBody2D):
		return
	used = true
	monitoring = false
	emit_signal("charge_granted", self)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "scale", Vector2(1.5, 1.5), 0.12)
	tween.tween_property(self, "modulate", Color(1, 1, 1, 0), 0.16)